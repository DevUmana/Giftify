import { OpenAI } from "@langchain/openai";
import { fetchProducts } from "./productsAPI.js";
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

export const promptFunc = async (
  recipients: {
    name: string;
    gender?: string;
    age?: number;
    gifts?: Array<{
      name: string;
      query: string;
      price: number;
      url: string;
      image: string;
    }>;
    recipientId: number;
    budget: number;
    status: boolean;
  }[]
): Promise<
  {
    recipientId: string;
    products: Array<{
      name: string;
      query: string;
      details: any;
    }>;
  }[]
> => {
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

      // get all the gifts name from the recipient
      const gifts = recipient.gifts?.map((gift) => gift.name) || [];

      // Construct a meaningful prompt for the OpenAI model
      const prompt = `
You are an expert in personalized gift recommendations. Using the details provided below, recommend three thoughtful and creative gift ideas.

Recipient Details:
- Name: ${recipient.name}
- Gender: ${recipient.gender || "Not specified"}
- Age: ${recipient.age || "Not specified"}
- Budget: $${recipient.budget}

Guidelines for the response:
- Provide a maximum of 3 Product Name
- Ensure to get the latest and trending products (Current date, 12/15/2024)
- Make sure the the product is of high quality
- Ensure the product are actual products and not services
- Do not return product with the name of ${gifts.join(
        ", "
      )} since this is already gifted to the recipient


The output MUST follow this exact format:
recipientId: ${
        recipient.recipientId
      }|"Product Name 1"|"Product Name 2"|"Product Name 3"
`;

      const output = await model.invoke(prompt);
      suggestions.push(output.trim());
    }

    // split the response into an array of strings using "|" as the delimiter
    const splitSuggestions: [string, ...string[]][] = suggestions.map(
      (suggestion) => suggestion.split("|") as [string, ...string[]]
    );

    const responses = await fetchProducts(splitSuggestions);

    return responses.map((response) => ({
      recipientId: response.recipientId,
      products: response.products.map((product) => ({
        name: product.name,
        query: product.query,
        details: product.details,
      })),
    }));
  } catch (err) {
    console.error("Error invoking OpenAI API:", err);
    throw new Error(
      `Error fetching responses from OpenAI: ${(err as Error).message}`
    );
  }
};
