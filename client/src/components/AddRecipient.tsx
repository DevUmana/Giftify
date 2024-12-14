import { useState, useEffect } from "react";
import { useMutation } from "@apollo/client";
import type { FormEvent } from "react";

import { ADD_RECIPIENT } from "../utils/mutations";

import { v4 as uuidv4 } from "uuid";

const AddRecipient: React.FC<{}> = ({}) => {
  const [recipientName, setRecipientName] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [age, setAge] = useState<string>("");
  const [budget, setBudget] = useState<string>("");
  const [alert, setAlert] = useState<{ message: string; type: string } | null>(
    null
  );

  const [addRecipient] = useMutation(ADD_RECIPIENT);

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
            gender: gender || null,
            age: parseInt(age) || null,
            gifts: [],
            recipientId: uuidv4(),
            budget: parsedBudget,
            status: false,
          },
        },
      });

      if (data?.addRecipient) {
        setRecipientName("");
        setGender("");
        setAge("");
        setBudget("");
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

  return (
    <>
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
      <h1 id="add-recipient">Add Recipient</h1>
      <form className="add-recipient" onSubmit={handleFormSubmit}>
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
          <label htmlFor="gender" className="form-label">
            Gender
          </label>
          <select
            className="form-select"
            id="gender"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          >
            <option value="" disabled>
              Select
            </option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="mb-3">
          <label htmlFor="age" className="form-label">
            Age
          </label>
          <input
            type="number"
            className="form-control"
            id="age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="Enter age"
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
        <button type="submit" className="btn btn-primary">
          Add Recipient
        </button>
      </form>
    </>
  );
};

export default AddRecipient;
