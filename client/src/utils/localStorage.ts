export const getRecipientIds = () => {
  const recipientIds = localStorage.getItem("saved_recipients")
    ? JSON.parse(localStorage.getItem("saved_recipients")!)
    : [];

  return recipientIds;
};

export const addRecipientIds = (recipientIdArr: string[]) => {
  if (recipientIdArr.length) {
    localStorage.setItem("saved_recipients", JSON.stringify(recipientIdArr));
  } else {
    localStorage.removeItem("saved_recipients");
  }
};

export const removeRecipientId = (recipientId: string) => {
  console.log("Removing recipient ID:", recipientId);

  const savedRecipientIds = JSON.parse(
    localStorage.getItem("saved_recipients") || "[]"
  );

  // Filter out the recipient to be removed
  const updatedSavedRecipientIds = savedRecipientIds.filter(
    (savedRecipientId: string) => savedRecipientId !== recipientId
  );

  if (updatedSavedRecipientIds.length) {
    localStorage.setItem(
      "saved_recipients",
      JSON.stringify(updatedSavedRecipientIds)
    );
  } else {
    localStorage.removeItem("saved_recipients");
  }

  return true;
};
