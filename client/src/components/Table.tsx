import React, { useEffect } from 'react';

type TableProps = {
    data: {
        name: string;
        gifts: string;
        budget: number;
        status: string;
        }[];
    };

const Table: React.FC<TableProps> = ({ data }) => { 
    const [recipients, addRecipients ] = React.useState(data); 

    useEffect(() => { 
        addRecipients(data);
    }, []);

    useEffect(() => {
        localStorage.setItem('recipients', JSON.stringify(recipients));
    }, [recipients])

    const removeRecipient = (name: string) => {
        const updatedRecipients = recipients.filter((recipient) => recipient.name !== name);
        addRecipients(updatedRecipients);
    };

return (
    <table className="table">
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
            {recipients.map((recipient) => (
                <tr key={recipient.name}>
                    <td>{recipient.name}</td>
                    <td>{recipient.gifts}</td>
                    <td>{recipient.budget}</td>
                    <td>{recipient.status}</td>
                    <td>
                        <button
                            onClick={() => removeRecipient(recipient.name)}
                            className="btn btn-danger"
                        >
                            Remove
                        </button>
                    </td>
                </tr>
            ))}
        </tbody>
    </table>
);
};

export default Table;



