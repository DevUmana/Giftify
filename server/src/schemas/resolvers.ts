import User, { IUserDocument } from "../models/User.js";
import { signToken, AuthenticationError } from "../services/auth.js";
import { promptFunc } from "../services/openAI.js";

interface Context {
  user?: IUserDocument | null;
}

interface AddUserArgs {
  input: {
    username: string;
    email: string;
    password: string;
  };
}

interface LoginUserArgs {
  input: {
    email: string;
    password: string;
  };
}

interface RecipientArgs {
  input: {
    name: string;
    gender?: string;
    age?: number;
    gifts?: string[];
    recipientId: number;
    budget: number;
    status: boolean;
  };
}

interface RemoveRecipientArgs {
  recipientId: string;
}

const resolvers = {
  Query: {
    me: async (_parent: unknown, _args: any, context: Context) => {
      if (!context.user) throw new AuthenticationError("Not logged in.");

      const userData = await User.findOne({ _id: context.user._id }).select(
        "-__v -password"
      );
      if (!userData) throw new Error("User not found.");
      return userData;
    },
  },
  Mutation: {
    addUser: async (_parent: unknown, { input }: AddUserArgs) => {
      const user = await User.create(input);
      const token = signToken(user.username, user.email, user._id);
      return { token, user };
    },
    login: async (_parent: unknown, { input }: LoginUserArgs) => {
      const user = await User.findOne({ email: input.email });
      if (!user)
        throw new AuthenticationError("Couldn't find user with this email!");

      const correctPw = await user.isCorrectPassword(input.password);
      if (!correctPw) throw new AuthenticationError("Incorrect password!");

      const token = signToken(user.username, user.email, user._id);
      return { token, user };
    },
    addRecipient: async (
      _parent: unknown,
      { input }: RecipientArgs,
      context: Context
    ) => {
      if (!context.user)
        throw new AuthenticationError("You need to be logged in!");

      const updatedUser = await User.findOneAndUpdate(
        { _id: context.user._id },
        { $addToSet: { recipientList: input } },
        { new: true, runValidators: true }
      );

      if (!updatedUser) throw new Error("User not found.");
      return updatedUser;
    },
    removeRecipient: async (
      _parent: unknown,
      { recipientId }: RemoveRecipientArgs,
      context: Context
    ) => {
      if (!context.user)
        throw new AuthenticationError("You need to be logged in!");

      const updatedUser = await User.findOneAndUpdate(
        { _id: context.user._id },
        { $pull: { recipientList: { recipientId } } },
        { new: true }
      );

      if (!updatedUser) throw new Error("User not found.");
      return updatedUser;
    },
    openAIResponse: async (_parent: unknown, { input }: RecipientArgs) => {
      const responses = await promptFunc([input]);
      if (!responses || responses.length === 0)
        throw new Error("No response from OpenAI.");
      return responses;
    },
    updateRecipientStatus: async (
      _parent: unknown,
      { input }: RecipientArgs,
      context: Context
    ) => {
      if (!context.user)
        throw new AuthenticationError("You need to be logged in!");

      const updateFields: Record<string, any> = {};

      if (input.name !== undefined)
        updateFields["recipientList.$.name"] = input.name;
      if (input.gender !== undefined)
        updateFields["recipientList.$.gender"] = input.gender;
      if (input.age !== undefined)
        updateFields["recipientList.$.age"] = input.age;
      if (input.budget !== undefined)
        updateFields["recipientList.$.budget"] = input.budget;
      if (input.status !== undefined)
        updateFields["recipientList.$.status"] = input.status;

      // First, handle non-gift updates
      if (Object.keys(updateFields).length > 0) {
        const updatedUser = await User.findOneAndUpdate(
          {
            _id: context.user._id,
            "recipientList.recipientId": input.recipientId,
          },
          { $set: updateFields },
          { new: true }
        );

        if (!updatedUser) throw new Error("User or recipient not found.");
      }

      // Then, handle gifts (separate operation)
      if (input.gifts !== undefined) {
        const updatedUser = await User.findOneAndUpdate(
          {
            _id: context.user._id,
            "recipientList.recipientId": input.recipientId,
          },
          { $push: { "recipientList.$.gifts": { $each: input.gifts } } },
          { new: true }
        );

        if (!updatedUser) throw new Error("User or recipient not found.");
        return updatedUser;
      }

      // Return updated user after all operations
      return await User.findById(context.user._id);
    },
    removeGiftFromRecipient: async (
      _parent: unknown,
      { recipientId, giftIndex }: { recipientId: string; giftIndex: number },
      context: Context
    ) => {
      if (!context.user)
        throw new AuthenticationError("You need to be logged in!");

      // Step 1: Nullify the specific index using $unset
      const unsetResult = await User.findOneAndUpdate(
        {
          _id: context.user._id,
          "recipientList.recipientId": recipientId,
        },
        { $unset: { [`recipientList.$.gifts.${giftIndex}`]: 1 } },
        { new: true }
      );

      if (!unsetResult) throw new Error("User or recipient not found.");

      // Step 2: Remove null values from the array using $pull
      const updatedUser = await User.findOneAndUpdate(
        {
          _id: context.user._id,
          "recipientList.recipientId": recipientId,
        },
        { $pull: { "recipientList.$.gifts": null } },
        { new: true }
      );

      if (!updatedUser) throw new Error("Failed to update recipient gifts.");
      return updatedUser;
    },
  },
};

export default resolvers;
