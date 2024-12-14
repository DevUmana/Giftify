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
    gender?: string;
    age?: number;
    gifts?: string[];
    budget: number;
    status: boolean;
  }[]
): Promise<string[]> => {
  try {
    const suggestions: string[] = [];

    // Flatten the recipients array
    const flattenedRecipients = recipients.flat();
    // Process each recipient in the array
    for (const recipient of flattenedRecipients) {
      if (
        !recipient.name ||
        recipient.budget === undefined ||
        recipient.budget === null
      ) {
        throw new Error("Recipient name and budget are required.");
      }

      // skip recipients with status set to true
      if (recipient.status) {
        continue;
      }
      // Construct a meaningful prompt for the OpenAI model
      const prompt = `
      You are an expert in personalized gift recommendations. Using the details provided below, recommend three thoughtful and creative gift ideas.
      Recipient Details:
      - Name: ${recipient.name}
      - Gender: ${recipient.gender || "Not specified"}
      - Age: ${recipient.age || "Not specified"}
      - Budget: $${recipient.budget}
      
      Guidelines for the response:
      - The suggestions must align closely with the recipient's provided gift ideas or interests.
      - Consider the budget when suggesting items.
      - Include a header "Gift Ideas for [Recipient's Name]:" before listing the suggestions.
      - Provide a maximum of 6 gift ideas.
      - Each gift idea should include the name, a link to the product, and the price.

      Return response format example:
      "Gift Ideas for ${recipient.name}: 
      1. [Gift Idea Name 1], [Gift Idea Link 1], [Gift Idea Price 1], 
      2. [Gift Idea Name 2], [Gift Idea Link 2], [Gift Idea Price 2], 
      3. [Gift Idea Name 3], [Gift Idea Link 3], [Gift Idea Price 3], 
      4. [Gift Idea Name 4], [Gift Idea Link 4], [Gift Idea Price 4],
      5. [Gift Idea Name 5], [Gift Idea Link 5], [Gift Idea Price 5],
      6. [Gift Idea Name 6], [Gift Idea Link 6], [Gift Idea Price 6]"
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
