import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@apollo/client";
import type { FormEvent } from "react";

import Auth from "../utils/auth";
import { ADD_RECIPIENT, REMOVE_RECIPIENT } from "../utils/mutations";
import { GET_ME } from "../utils/queries";
import Table from "../components/Table";

import type { Recipient } from "../models/Recipient";
import { v4 as uuidv4 } from "uuid";

const Home = () => {
  // Local state hooks for form inputs and recipient list
  const [recipientList, setRecipientList] = useState<Recipient[]>([]);
  const [recipientName, setRecipientName] = useState<string>("");
  const [budget, setBudget] = useState<string>("");
  const [gifts, setGifts] = useState<string>("");

  // Query and mutation hooks
  const [removeRecipient] = useMutation(REMOVE_RECIPIENT);
  const [addRecipient] = useMutation(ADD_RECIPIENT);
  const { data, loading } = useQuery(GET_ME);

  // Update recipientList when data changes
  useEffect(() => {
    if (data?.me?.recipientList) {
      setRecipientList(data.me.recipientList);
    }
  }, [data]);

  // Handle form submission
  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Validate recipient name and budget
    const parsedBudget = parseFloat(budget);
    if (!recipientName || isNaN(parsedBudget) || parsedBudget <= 0) {
      alert("Please provide valid recipient details.");
      return;
    }

    try {
      const { data } = await addRecipient({
        variables: {
          input: {
            name: recipientName,
            budget: parsedBudget,
            gifts: gifts.split(","),
            status: false,
            recipientId: uuidv4(),
          },
        },
      });

      if (data?.addRecipient) {
        setRecipientList(data.addRecipient.recipientList);
        setRecipientName("");
        setBudget("");
        setGifts("");
      }
    } catch (err) {
      console.error("Error adding recipient:", err);
      alert("Failed to add recipient. Please try again.");
    }
  };

  // Handle removing a recipient
  const handleRemoveRecipient = async (recipientId: string) => {
    try {
      await removeRecipient({
        variables: { recipientId },
      });

      setRecipientList((prevList) =>
        prevList.filter((recipient) => recipient.recipientId !== recipientId)
      );
    } catch (err) {
      console.error("Error removing recipient:", err);
      alert("Failed to remove recipient. Please try again.");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <>
      {Auth.loggedIn() ? (
        <div className="container">
          <h1 className="display-2">Add Recipient</h1>
          <form onSubmit={handleFormSubmit}>
            <div className="mb-3">
              <label htmlFor="recipientName" className="form-label">
                Recipient Name
              </label>
              <input
                type="text"
                className="form-control"
                id="recipientName"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Enter a name"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="budget" className="form-label">
                Budget
              </label>
              <input
                type="number"
                className="form-control"
                id="budget"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="Enter a budget"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="gifts" className="form-label">
                Gift Ideas
              </label>
              <input
                type="text"
                className="form-control"
                id="gifts"
                value={gifts}
                onChange={(e) => setGifts(e.target.value)}
                placeholder="Enter gift ideas"
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Add Recipient
            </button>
          </form>
          <Table data={recipientList} onRemove={handleRemoveRecipient} />
        </div>
      ) : (
        <div className="container">
          <h1 className="display-2">Welcome to Giftify!</h1>
          <p className="lead">Login to start</p>
        </div>
      )}
    </>
  );
};

export default Home;
