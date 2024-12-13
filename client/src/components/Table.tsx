import type { Recipient } from "../models/Recipient";
import '../Table.css';
import bowImage from '../assets/bow.png';

const Table: React.FC<{
  data: Recipient[];
  onRemove: (recipientId: string) => void;
}> = ({ data, onRemove }) => {
  console.log("Table data:", data);
  return (
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
            <th scope="col">Remove</th>
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((recipient) => (
              <tr key={recipient.recipientId}>
                <td>{recipient.name}</td>
                <td>{recipient.gifts.join(", ")}</td>
                <td>{recipient.budget}</td>
                <td className={`status ${recipient.status ? "wrapped" : "missing"}`}>
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
  );
};

export default Table;




