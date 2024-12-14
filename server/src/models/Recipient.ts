import { Schema, type Document } from "mongoose";

export interface RecipientDocument extends Document {
  name: string;
  gender: string;
  age: number;
  gifts: string[];
  recipientId: string;
  budget: number;
  status: boolean;
}

// This is a subdocument schema, it won't become its own model but we'll use it as the schema for the User's `savedRecipients` array in User.js
const recipientSchema = new Schema<RecipientDocument>({
  name: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
  },
  age: {
    type: Number,
  },
  gifts: [
    {
      type: String,
    },
  ],
  recipientId: {
    type: String,
    required: true,
  },
  budget: {
    type: Number,
    required: true,
  },
  status: {
    type: Boolean,
    required: true,
  },
});

export default recipientSchema;
