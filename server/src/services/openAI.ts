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
    giftIdeas?: string[];
    age: number;
    recipientId: string;
    gender: string;
    budget: number;
  }[]
): Promise<string[]> => {
  try {
    const suggestions: string[] = [];

    const intro = `ho ho ho! Greetings from the North Pole! Santa here, ready to help you find the perfect gifts for your loved ones. 🎅🎁`;

    // Process each recipient in the array
    for (const recipient of recipients) {
      // Construct a meaningful prompt for the OpenAI model

      const prompt = `
      You are an expert in personalized gift recommendations. Based on the following details, suggest thoughtful and creative gift ideas. Keep the response short, concise, and plain text only.
      
      Recipient Details:
      - Name: ${recipient.name}
      - Age: ${recipient.age}
      - Gender: ${recipient.gender}
      - Budget: $${recipient.budget}
      - Pre-existing Gift Ideas: ${recipient.giftIdeas?.join(", ") || "None"}
      
      Provide 3 thoughtful gift ideas tailored to the recipient's details. Start each suggestion with:
      "Gift Idea for ${recipient.name}:".
      `;

      const output = await model.invoke(prompt);
      suggestions.push(output.trim());
    }

    const outro = `I hope you found these suggestions helpful! If you need more ideas, just let me know. Happy holidays! 🎄🎁 `;

    const response = [intro, ...suggestions, outro];

    return response; // Return all suggestions as an array
  } catch (err) {
    console.error("Error invoking OpenAI API:", err);
    throw new Error(
      `Error fetching responses from OpenAI: ${(err as Error).message}`
    );
  }
};
