import React, { useState, useEffect } from "react";
import { Button, Modal } from "react-bootstrap";
import { Recipient } from "../models/Recipient";
import { REMOVE_GIFT } from "../utils/mutations";
import { useMutation } from "@apollo/client";

interface Gift {
  name: string;
  query: string;
  price: number;
  url: string;
  image: string;
}

interface ViewGiftsProps {
  gifts: Gift[];
  data: Recipient;
}

const ViewGifts: React.FC<ViewGiftsProps> = ({ gifts, data }) => {
  const [show, setShow] = useState(false);
  const [totalCost, setTotalCost] = useState<number>(0);
  const [removeGift] = useMutation(REMOVE_GIFT);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  // Calculate the total cost of all gifts
  useEffect(() => {
    const total = gifts.reduce((acc, gift) => acc + gift.price, 0);
    setTotalCost(total);
  }, [gifts]);

  const removeGiftFromList = async (recipientId: string, giftIndex: number) => {
    try {
      await removeGift({
        variables: {
          recipientId,
          giftIndex,
        },
      });
    } catch (err) {
      console.error("Error removing gift:", err);
    }
  };

  const TransformGifts = (gifts: Gift[]) => {
    return (
      <ul>
        {gifts.map((gift, index) => (
          <li key={`${gift.name}-${index}`}>
            <div className="gifts">
              <span className="giftName">Gift {index + 1}: </span>
              <a href={gift.url} target="_blank" rel="noreferrer">
                {gift.name}
              </a>
              <span> Price: ${gift.price.toFixed(2)}</span>
              <Button
                variant="danger"
                onClick={() => removeGiftFromList(data.recipientId, index)}
              >
                Remove
              </Button>
            </div>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div>
      <Button variant="primary" onClick={handleShow}>
        View Gifts
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header className="viewGifts-header" closeButton>
          <Modal.Title>
            Gifts for {data.name} - Total Cost: ${totalCost.toFixed(2)}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="viewGifts-body">
          {TransformGifts(gifts)}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ViewGifts;
