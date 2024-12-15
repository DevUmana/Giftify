import { useMutation } from "@apollo/client";
import { OPEN_AI_RESPONSE, UPDATE_RECIPIENT } from "../utils/mutations";
import type { Recipient } from "../models/Recipient";

const Suggestion: React.FC<{
  recipientList: Recipient[];
}> = ({ recipientList }) => {
  const [openAiResponse, { loading, data }] = useMutation(OPEN_AI_RESPONSE);
  const [updateRecipientStatus] = useMutation(UPDATE_RECIPIENT);

  function parseGiftIdeas(input: string, recipient: string) {
    const headerPattern = /^Gift Ideas for ([^:]+):/; // Extracts the header
    const giftPattern =
      /(\d+)\.\s(.+?),\s\[(https?:\/\/[^\]]+)\],\s\$(\d+\.\d{2})/g;

    // Extract header from input or use the provided recipient name
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

    return { header, gifts: results };
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

      if (data?.openAIResponse) {
        console.log(data.openAIResponse);
      }
    } catch (err) {
      console.error("Error calling OpenAI API:", err);
    }
  };

  const handleDataFormat = (
    data: string[],
    recipientList: { name: string; recipientId: string; status: boolean }[]
  ) => {
    // Filter recipients to remove those with status: true
    const filteredRecipients = recipientList.filter(
      (recipient) => !recipient.status
    );

    return data.map((suggestion, index) => {
      const recipient = filteredRecipients[index]; // Align filtered recipients with data

      if (!recipient) return null; // Safeguard in case of misalignment

      const parsedData = parseGiftIdeas(suggestion, recipient.name);
      const recipientId = recipient.recipientId;

      return (
        <>
          <p className="ideas" key={recipientId}>
            {parsedData.header}
            <ul className="ideas-list">
              {parsedData.gifts.map((gift, giftIndex) => (
                <li key={giftIndex}>
                  <a href={gift.link} target="_blank" rel="noreferrer">
                    {gift.name}
                  </a>
                  , <span>${gift.price}</span>
                  <button
                    className="btn"
                    onClick={(e) => {
                      addGiftToCart(
                        recipientId,
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
          </p>
        </>
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
