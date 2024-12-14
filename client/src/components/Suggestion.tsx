import { useMutation } from "@apollo/client";
import { OPEN_AI_RESPONSE } from "../utils/mutations";
import type { Recipient } from "../models/Recipient";

const Suggestion: React.FC<{
  recipientList: Recipient[];
}> = ({ recipientList }) => {
  const [openAiResponse, { loading, data }] = useMutation(OPEN_AI_RESPONSE);

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

      if (data?.openAIResponse) {
        console.log(data.openAIResponse);
      }
    } catch (err) {
      console.error("Error calling OpenAI API:", err);
    }
  };

  const handleDataFormat = (data: string[]) => {
    return data.map((suggestion, index) => (
      <p className="ideas" key={index}>
        {suggestion}
      </p>
    ));
  };

  return (
    <div className="suggestion">
      <button onClick={handleOpenAi} className="btn" disabled={loading}>
        Get Gift Suggestions
      </button>
      {loading && <p>Thinking...</p>}
      {data && (
        <div className="suggestion-data">
          {handleDataFormat(data.openAIResponse)}
        </div>
      )}
    </div>
  );
};

export default Suggestion;
