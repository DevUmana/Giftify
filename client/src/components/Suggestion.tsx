import { useMutation } from "@apollo/client";
import { OPEN_AI_RESPONSE } from "../utils/mutations";
import type { Recipient } from "../models/Recipient";

const Suggestion: React.FC<{
  recipientList: Recipient[];
}> = ({ recipientList }) => {
  const [openAiResponse, { loading, error, data }] =
    useMutation(OPEN_AI_RESPONSE);

  const handleOpenAi = async () => {
    // Transform recipientList to match the RecipientInput type
    const transformedRecipients = recipientList.map((recipient) => ({
      name: recipient.name,
      gifts: recipient.gifts,
      budget: recipient.budget || null,
      status: recipient.status,
    }));

    try {
      const { data } = await openAiResponse({
        variables: {
          input: transformedRecipients,
        },
      });

      console.log("OpenAI response:", data?.openAIResponse);
    } catch (err) {
      console.error("Error calling OpenAI API:", err);
    }
  };

  const handleDataFormat = (data: string[]) => {
    return data.map((suggestion, index) => <p key={index}>{suggestion}</p>);
  };

  return (
    <div>
      {loading && <p>Loading...</p>}
      <button
        onClick={handleOpenAi}
        className="btn btn-primary"
        disabled={loading}
      >
        Get Gift Suggestions
      </button>
      {data && (
        <div>
          <p>
            ho ho ho! Greetings from the North Pole! Santa here, ready to help
            you find the perfect gifts for your loved ones. 🎅🎁
          </p>
          {handleDataFormat(data.openAIResponse)}
          <p>
            I hope you found these suggestions helpful! If you need more ideas,
            just let me know. Happy holidays! 🎄🎁
          </p>
        </div>
      )}
    </div>
  );
};

export default Suggestion;
