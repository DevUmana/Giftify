import { OpenAI } from "@langchain/openai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error("OPENAI_API_KEY is not configured.");
  process.exit(1);
}

const model = new OpenAI({
  temperature: 0.7,
  openAIApiKey: apiKey,
  modelName: "gpt-4o",
  maxTokens: 300,
  topP: 1,
  frequencyPenalty: 0.5,
  presencePenalty: 0.5,
});

/**
 * Generate gift suggestions for an array of recipients.
 *
 * @param recipients Array of recipient objects.
 * @returns Promise<string[]> Array of gift suggestions for each recipient.
 */
export const promptFunc = async (
  recipients: {
    name: string;
    gifts?: string[];
    budget: number;
    status: boolean;
  }[]
): Promise<string[]> => {
  try {
    const suggestions: string[] = [];

    // Process each recipient in the array
    for (const recipient of recipients) {
      if (!recipient.name || !recipient.budget) {
        throw new Error("Recipient name and budget are required.");
      }

      // skip recipients with status set to true
      if (recipient.status) {
        continue;
      }
      // Construct a meaningful prompt for the OpenAI model
      const prompt = `
      You are an expert in personalized gift recommendations. Using the details provided below, recommend three thoughtful and creative gift ideas. Base your recommendations strictly on the recipient's provided gift ideas or interests. Avoid adding unrelated suggestions.
      
      Recipient Details:
      - Name: ${recipient.name}
      - Budget: $${recipient.budget}
      - Gift Ideas or Interests: ${recipient.gifts?.join(", ") || "None"}
      
      Guidelines for the response:
      - The suggestions must align closely with the recipient's provided gift ideas or interests.
      - Consider the budget when suggesting items.
      - Include a header "Gift Ideas for [Recipient's Name]:" before listing the suggestions.
      - The response should  plain text only, and formatted as a single sentence listing the three ideas, separated by commas.
      - Do not include suggestions unrelated to the gift ideas or interests provided.
      
      Provide your response as a single plain text sentence.
      `;

      const output = await model.invoke(prompt);
      suggestions.push(output.trim());
    }

    const response = suggestions.map((suggestion) => suggestion);

    return response; // Return all suggestions as an array
  } catch (err) {
    console.error("Error invoking OpenAI API:", err);
    throw new Error(
      `Error fetching responses from OpenAI: ${(err as Error).message}`
    );
  }
};
