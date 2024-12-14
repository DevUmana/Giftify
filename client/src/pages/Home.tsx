import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@apollo/client";

import Auth from "../utils/auth";
import { REMOVE_RECIPIENT } from "../utils/mutations";
import { GET_ME } from "../utils/queries";

import AddRecipient from "../components/AddRecipient";
import Suggestion from "../components/Suggestion";
import Table from "../components/Table";

import type { Recipient } from "../models/Recipient";

const Home = () => {
  const [recipientList, setRecipientList] = useState<Recipient[]>([]);
  const [alert, setAlert] = useState<{ message: string; type: string } | null>(
    null
  );

  const [removeRecipient] = useMutation(REMOVE_RECIPIENT);
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

  console.log(recipientList);

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
              <AddRecipient />
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
