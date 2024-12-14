import React, { useState, useEffect } from "react";
import { Button, Modal } from "react-bootstrap";
import { Recipient } from "../models/Recipient";
import { REMOVE_GIFT } from "../utils/mutations";
import { useMutation } from "@apollo/client";

interface ViewGiftsProps {
  gifts: string[];
  data: Recipient;
}

const ViewGifts: React.FC<ViewGiftsProps> = ({ gifts, data }) => {
  const [show, setShow] = useState(false);
  const [totalCost, setTotalBudget] = useState<number>(0);
  const [removeGift] = useMutation(REMOVE_GIFT);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  useEffect(() => {
    const total = gifts.reduce((acc, gift) => {
      console.log("Gift:", gift);
      const [, , price] = gift.split("|");
      console.log("Price:", price);
      //split the price $ sign and convert to integer
      const convertedPrice = parseInt(price.split("$")[1]);
      return acc + convertedPrice;
    }, 0);
    setTotalBudget(total);
    console.log("Total cost:", total);
  }, [gifts]);

  const removeGiftFromList = async (recipientId: string, giftIndex: number) => {
    console.log(recipientId, giftIndex);
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

  const TransformGifts = (gifts: string[]) => {
    return (
      <ul>
        {gifts.map((gift, index) => {
          const [name, link, price] = gift.split("|");
          if (!name || !link || !price) {
            console.error(`Invalid gift format: ${gift}`);
            return null;
          }

          return (
            <li key={`${gift}-${index}`}>
              <div className="gifts">
                <span className="giftName">Gift {index + 1} </span>
                <a href={link} target="_blank" rel="noreferrer">
                  {name}
                </a>
                <span> Price: {price}</span>
                <Button
                  variant="danger"
                  onClick={() => removeGiftFromList(data.recipientId, index)}
                >
                  Remove
                </Button>
              </div>
            </li>
          );
        })}
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
            Gifts for {data.name} - Total Cost: ${totalCost}
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
