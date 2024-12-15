import { useMutation } from "@apollo/client";
import { OPEN_AI_RESPONSE, UPDATE_RECIPIENT } from "../utils/mutations";
import type { Recipient } from "../models/Recipient";

const Suggestion: React.FC<{
  recipientList: Recipient[];
}> = ({ recipientList }) => {
  const [openAiResponse, { loading, data }] = useMutation(OPEN_AI_RESPONSE);
  const [updateRecipientStatus] = useMutation(UPDATE_RECIPIENT);

  function parseGiftIdeas(input: string, recipient: string) {
    const recipientIdPattern = /RecipientId: ([a-f0-9\-]+)/i;
    const headerPattern = /^Gift Ideas for ([^:]+):/; // Extracts the header
    const giftPattern =
      /(\d+)\.\s(.+?),\s\[(https?:\/\/[^\]]+)\],\s\$(\d+\.\d{2})/g;

    // Extract header from input or use the provided recipient name

    const recipientIdMatch = input.match(recipientIdPattern);
    if (!recipientIdMatch) {
      throw new Error("Recipient ID not found in response.");
    }
    const recipientId = recipientIdMatch[1];

    const headerMatch = input.match(headerPattern);
    const header = headerMatch
      ? `Gift Ideas for ${headerMatch[1]}:`
      : `Gift Ideas for ${recipient}:`;

    // Extract gift details
    const results = [];
    let match;

    while ((match = giftPattern.exec(input)) !== null) {
      results.push({
        name: match[2].trim(),
        link: match[3].trim(),
        price: parseFloat(match[4].trim()),
      });
    }

    return { recipientId, header, gifts: results };
  }

  const addGiftToCart = async (
    recipientId: string,
    giftName: string,
    giftLink: string,
    giftPrice: number
  ) => {
    try {
      const giftString = `${giftName}|${giftLink}|$${giftPrice.toFixed(2)}`;
      // Call the updateRecipientStatus mutation
      await updateRecipientStatus({
        variables: {
          input: {
            recipientId,
            gifts: [giftString],
          },
        },
      });
    } catch (err) {
      console.error("Error updating recipient status:", err);
    }
  };

  const handleOpenAi = async () => {
    // Transform recipientList to match the RecipientInput type
    const transformedRecipients = recipientList.map((recipient) => ({
      name: recipient.name,
      gender: recipient.gender || null,
      age: recipient.age || null,
      gifts: recipient.gifts,
      recipientId: recipient.recipientId,
      budget: recipient.budget || null,
      status: recipient.status,
    }));

    try {
      const { data } = await openAiResponse({
        variables: {
          input: transformedRecipients,
        },
      });

      return data;
    } catch (err) {
      console.error("Error calling OpenAI API:", err);
    }
  };

  const handleDataFormat = (
    data: string[],
    recipientList: { name: string; recipientId: string; status: boolean }[]
  ) => {
    // Filter recipients to exclude those with status: true
    const filteredRecipients = recipientList.filter(
      (recipient) => !recipient.status
    );

    // Map through filtered recipients and match suggestions with recipientId
    return filteredRecipients.map((recipient) => {
      // Find the matching suggestion for the recipient
      const suggestion = data.find((s) => s.includes(recipient.recipientId));

      if (!suggestion) return null; // No suggestion for this recipient

      // Parse the gift suggestion
      const parsedData = parseGiftIdeas(suggestion, recipient.name);

      return (
        <div className="ideas" key={recipient.recipientId}>
          {parsedData.header}
          <ul className="ideas-list">
            {parsedData.gifts.map((gift, index) => (
              <li key={index}>
                <a href={gift.link} target="_blank" rel="noreferrer">
                  {gift.name}
                </a>
                , <span>${gift.price}</span>
                <button
                  className="btn"
                  onClick={(e) => {
                    addGiftToCart(
                      recipient.recipientId,
                      gift.name,
                      gift.link,
                      gift.price
                    );
                    (e.target as HTMLButtonElement).style.display = "none";
                  }}
                >
                  Add Gift
                </button>
              </li>
            ))}
          </ul>
        </div>
      );
    });
  };

  return (
    <div className="suggestion">
      <button onClick={handleOpenAi} className="btn" disabled={loading}>
        Get Gift Suggestions
      </button>
      {loading && <p>Thinking...</p>}
      {data && (
        <div className="suggestion-data">
          {handleDataFormat(data.openAIResponse, recipientList)}
        </div>
      )}
    </div>
  );
};

export default Suggestion;
