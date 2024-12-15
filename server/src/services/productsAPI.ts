import dotenv from "dotenv";
dotenv.config();

export const fetchProducts = async (suggestions: [string, ...string[]][]) => {
  const url = "https://real-time-product-search.p.rapidapi.com/search-v2";
  const apiKey = process.env.RAPIDAPI_KEY as string;

  const options = {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": apiKey,
      "X-RapidAPI-Host": "real-time-product-search.p.rapidapi.com",
    },
  };

  // Array to store results
  const results: Array<{
    recipientId: string;
    products: Array<{
      name: string;
      query: string;
      details: any;
    }>;
  }> = [];

  try {
    // Loop through each recipient's suggestions
    for (const suggestion of suggestions) {
      const recipientId = suggestion[0].split(": ")[1]; // Extract recipientId
      const productNames = suggestion.slice(1); // Extract product names

      // Array to store product details for this recipient
      const recipientProducts: Array<{
        name: string;
        query: string;
        details: any;
      }> = [];

      // Fetch product details for each product name
      for (const product of productNames) {
        const query = product.replace(/"/g, ""); // Remove surrounding quotes
        const response = await fetch(
          `${url}?q=${encodeURIComponent(query)}&country=us`,
          options
        );

        if (!response.ok) {
          throw new Error(
            `Error fetching data for ${query}: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();

        // Add product details to the recipient's array
        recipientProducts.push({
          name: product, // Original product name
          query: query, // Cleaned query string
          details: data, // Response data
        });
      }

      // Add recipient and their products to the results array
      results.push({
        recipientId,
        products: recipientProducts,
      });
    }

    // Return the accumulated results
    return results;
  } catch (error) {
    console.error("Error fetching product data:", error);
    return [];
  }
};
