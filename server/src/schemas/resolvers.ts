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

interface AddRecipientArgs {
  input: {
    name: string;
    gifts: string[];
    recipientId: string;
    budget: number;
    status: boolean;
  };
}

interface OpenAIResponseArgs {
  input: Array<{
    name: string;
    gifts?: string[];
    budget: number;
    status: boolean;
  }>;
}

interface RemoveRecipientArgs {
  recipientId: string;
}

interface UpdateRecipientStatusArgs {
  input: {
    recipientId: string;
    name?: string;
    gifts?: string[];
    budget?: number;
    status?: boolean;
  };
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
      { input }: AddRecipientArgs,
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
    openAIResponse: async (_parent: unknown, { input }: OpenAIResponseArgs) => {
      const responses = await promptFunc(input);
      if (!responses || responses.length === 0)
        throw new Error("No response from OpenAI.");
      return responses;
    },
    updateRecipientStatus: async (
      _parent: unknown,
      { input }: UpdateRecipientStatusArgs,
      context: Context
    ) => {
      if (!context.user)
        throw new AuthenticationError("You need to be logged in!");

      const updateFields: Record<string, any> = {};
      if (input.name !== undefined)
        updateFields["recipientList.$.name"] = input.name;
      if (input.gifts !== undefined)
        updateFields["recipientList.$.gifts"] = input.gifts;
      if (input.budget !== undefined)
        updateFields["recipientList.$.budget"] = input.budget;
      if (input.status !== undefined)
        updateFields["recipientList.$.status"] = input.status;

      const updatedUser = await User.findOneAndUpdate(
        {
          _id: context.user._id,
          "recipientList.recipientId": input.recipientId,
        },
        { $set: updateFields },
        { new: true }
      );

      if (!updatedUser) throw new Error("User or recipient not found.");
      return updatedUser;
    },
  },
};

export default resolvers;
