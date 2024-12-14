import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@apollo/client";
import type { FormEvent } from "react";

import Auth from "../utils/auth";
import { ADD_RECIPIENT, REMOVE_RECIPIENT } from "../utils/mutations";
import { GET_ME } from "../utils/queries";

import Suggestion from "../components/Suggestion";
import Table from "../components/Table";

import type { Recipient } from "../models/Recipient";
import { v4 as uuidv4 } from "uuid";

const Home = () => {
  const [recipientList, setRecipientList] = useState<Recipient[]>([]);
  const [recipientName, setRecipientName] = useState<string>("");
  const [budget, setBudget] = useState<string>("");
  const [gifts, setGifts] = useState<string>("");
  const [alert, setAlert] = useState<{ message: string; type: string } | null>(
    null
  );

  const [removeRecipient] = useMutation(REMOVE_RECIPIENT);
  const [addRecipient] = useMutation(ADD_RECIPIENT);
  const { data, loading } = useQuery(GET_ME);

  useEffect(() => {
    if (data?.me?.recipientList) {
      setRecipientList(data.me.recipientList);
    }
  }, [data]);

  // Automatically hide alert after 3 seconds
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsedBudget = parseFloat(budget);
    if (!recipientName || isNaN(parsedBudget) || parsedBudget <= 0) {
      setAlert({
        message: "Please provide valid recipient details.",
        type: "danger",
      });
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
        setAlert({ message: "Recipient added successfully!", type: "success" });
      }
    } catch (err) {
      console.error("Error adding recipient:", err);
      setAlert({
        message: "Failed to add recipient. Please try again.",
        type: "danger",
      });
    }
  };

  const handleRemoveRecipient = async (recipientId: string) => {
    try {
      await removeRecipient({
        variables: { recipientId },
      });

      setRecipientList((prevList) =>
        prevList.filter((recipient) => recipient.recipientId !== recipientId)
      );
      setAlert({ message: "Recipient removed successfully!", type: "success" });
    } catch (err) {
      console.error("Error removing recipient:", err);
      setAlert({
        message: "Failed to remove recipient. Please try again.",
        type: "danger",
      });
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <>
      {Auth.loggedIn() ? (
        <>
          <div className="container">
            {alert && (
              <div
                className={`alert alert-${alert.type} alert-dismissible fade show`}
                role="alert"
              >
                {alert.message}
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="alert"
                  aria-label="Close"
                  onClick={() => setAlert(null)}
                ></button>
              </div>
            )}
            <div className="section-1">
              <h1 id="add-recipient">Add Recipient</h1>
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
            </div>
            <div className="section-2">
              <Table data={recipientList} onRemove={handleRemoveRecipient} />
            </div>
          </div>
          <div className="section-3">
            <Suggestion recipientList={recipientList} />
          </div>
        </>
      ) : (
        <div className="container-unauth">
          <h1 className="display-2">Welcome to Giftify!</h1>
          <p className="lead">Login to start planning!</p>
        </div>
      )}
    </>
  );
};

export default Home;
