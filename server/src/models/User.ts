import { Schema, model, type Document } from "mongoose";
import bcrypt from "bcrypt";

// import schema from Recipient.js
import recipientSchema from "./Recipient.js";
import type { RecipientDocument } from "./Recipient.js";

export interface IUserDocument extends Document {
  id: string;
  username: string;
  email: string;
  password: string;
  recipientList: RecipientDocument[];
  isCorrectPassword(password: string): Promise<boolean>;
  recipientCount: number;
}

const userSchema = new Schema<IUserDocument>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/.+@.+\..+/, "Must use a valid email address"],
    },
    password: {
      type: String,
      required: true,
    },
    // set recipientList to be an array of data that adheres to the recipientSchema
    recipientList: [recipientSchema],
  },
  // set this to use virtual below
  {
    toJSON: {
      virtuals: true,
    },
  }
);

// hash user password
userSchema.pre("save", async function (next) {
  if (this.isNew || this.isModified("password")) {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }

  next();
});

// custom method to compare and validate password for logging in
userSchema.methods.isCorrectPassword = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

// when we query a user, we'll also get another field called `recipientCount` with the number of saved recipient we have
userSchema.virtual("recipientCount").get(function () {
  return this.recipientList.length;
});

const User = model<IUserDocument>("User", userSchema);

export default User;
