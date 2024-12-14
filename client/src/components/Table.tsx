import { useState, useEffect } from "react";
import type { Recipient } from "../models/Recipient";
import bowImage from "../assets/bow.png";

import { useMutation } from "@apollo/client";
import { UPDATE_RECIPIENT_STATUS } from "../utils/mutations";

const Table: React.FC<{
  data: Recipient[];
  onRemove: (recipientId: string) => void;
}> = ({ data, onRemove }) => {
  const [updateRecipientStatus] = useMutation(UPDATE_RECIPIENT_STATUS);
  const [totalBudget, setTotalBudget] = useState<number>(0);
  const today = new Date();
  const christmas = new Date("2024-12-25");
  const daysLeft = Math.floor(
    (christmas.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  useEffect(() => {
    setTotalBudget(data.reduce((acc, recipient) => acc + recipient.budget, 0));
  }, [data]);

  const handleStatusUpdate = async (recipientId: string, status: boolean) => {
    try {
      await updateRecipientStatus({
        variables: {
          input: {
            recipientId,
            status,
          },
        },
      });
    } catch (err) {
      console.error("Error updating recipient status:", err);
    }
  };

  return (
    <>
      <div className="table-container">
        <div className="gift-bow">
          <img src={bowImage} alt="Gift Bow" className="bow-image" />
        </div>
        <table className="table" role="table">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Gifts</th>
              <th scope="col">Budget</th>
              <th scope="col">Status</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((recipient) => (
                <tr key={recipient.recipientId}>
                  <td>{recipient.name}</td>
                  <td>{recipient.gifts.length ? "w" : "Look for one!"}</td>
                  <td>${recipient.budget}</td>
                  <td
                    className={`status ${
                      recipient.status ? "wrapped" : "missing"
                    }`}
                    onClick={() =>
                      handleStatusUpdate(
                        recipient.recipientId,
                        !recipient.status
                      )
                    }
                  >
                    {recipient.status ? "Wrapped" : "Missing Gift"}
                  </td>
                  <td>
                    <button
                      onClick={() => onRemove(recipient.recipientId)}
                      className="btn btn-danger"
                      aria-label={`Remove ${recipient.name}`}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center">
                  No recipients found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="table-info">
        <p>
          Santa's Budget: <span id="totalBudget">${totalBudget}</span>
        </p>
        <p>
          Santa's Deadline:{" "}
          {daysLeft > 0 ? (
            <span id="daysLeft">{daysLeft} days left</span>
          ) : (
            <span className="deadline-met">The deadline has been met!</span>
          )}
        </p>
      </div>
    </>
  );
};

export default Table;
