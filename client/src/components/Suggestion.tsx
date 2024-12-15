import { useMutation } from "@apollo/client";
import { OPEN_AI_RESPONSE, UPDATE_RECIPIENT } from "../utils/mutations";
import type { Recipient } from "../models/Recipient";

const Suggestion: React.FC<{
  recipientList: Recipient[];
}> = ({ recipientList }) => {
  const [openAiResponse, { loading, data }] = useMutation(OPEN_AI_RESPONSE);
  const [updateRecipient] = useMutation(UPDATE_RECIPIENT);

  const handleOpenAi = async () => {
    // Transform recipientList to match the RecipientInput type
    const transformedRecipients = recipientList.map((recipient) => ({
      name: recipient.name,
      gender: recipient.gender || null,
      age: recipient.age || null,
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

      const parsedData = parseData(data);
      console.log("Parsed data:", parsedData);
      return parsedData;
    } catch (err) {
      console.error("Error calling OpenAI API:", err);
    }
  };

  const parseData = (data: any) => {
    const parsedData = data.openAIResponse.map((response: any) => {
      return {
        recipientId: response.recipientId,
        products: response.products.map((product: any) => ({
          name: product.name,
          query: product.query,
          details: product.details.data.products[0],
        })),
      };
    });

    return parsedData;
  };

  const addGiftToCart = async (
    recipientId: string,
    query: string,
    price: string,
    url: string,
    image: string
  ) => {
    try {
      const splitPrice = price.split("$")[1];
      const convertedPrice = parseFloat(splitPrice);
      console.log("Converted price:", convertedPrice);

      await updateRecipient({
        variables: {
          input: {
            recipientId,
            gifts: [
              {
                name: query,
                query,
                price: convertedPrice,
                url,
                image,
              },
            ],
          },
        },
      });
    } catch (err) {
      console.error("Error updating recipient:", err);
    }
  };

  return (
    <div className="suggestion">
      <button onClick={handleOpenAi} className="btn" disabled={loading}>
        Get Gift Suggestions
      </button>
      {loading && <p className="openAI">Thinking...</p>}
      {data && (
        <div className="suggestion-data">
          {parseData(data).map((recipient: any) => (
            <div key={recipient.recipientId} className="recipient">
              <p>
                Gift Ideas for:{" "}
                {
                  recipientList.find(
                    (r) => r.recipientId === recipient.recipientId
                  )?.name
                }
              </p>
              <ul>
                {recipient.products.map((product: any, index: number) => (
                  <li key={index}>
                    <img
                      src={product.details.product_photos[0]}
                      alt="Product"
                    />
                    <a
                      href={product.details.offer.offer_page_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {product.query}
                    </a>{" "}
                    <span>- Price: {product.details.offer.price}</span>
                    <button
                      className="btn"
                      disabled={loading}
                      onClick={(e) => {
                        addGiftToCart(
                          recipient.recipientId,
                          product.query,
                          product.details.offer.price,
                          product.details.offer.offer_page_url,
                          product.details.product_photos[0]
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
          ))}
        </div>
      )}
    </div>
  );
};

export default Suggestion;
