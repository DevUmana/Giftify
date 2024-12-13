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

const resolvers = {
  Query: {
    me: async (
      _parent: unknown,
      _args: unknown,
      context: Context
    ): Promise<IUserDocument | null> => {
      if (!context.user) {
        throw new AuthenticationError("Not logged in.");
      }

      try {
        const userData = await User.findOne({ _id: context.user._id }).select(
          "-__v -password"
        );
        return userData;
      } catch (err) {
        console.error("Error retrieving user data:", err);
        throw new Error("Failed to retrieve user data.");
      }
    },
  },
  Mutation: {
    addUser: async (
      _parent: unknown,
      { input }: AddUserArgs
    ): Promise<{
      token: string;
      user: IUserDocument;
    }> => {
      try {
        const user = await User.create({ ...input });
        const token = signToken(user.username, user.email, user._id);
        return { token, user };
      } catch (err) {
        console.error("Error creating user:", err);
        throw new Error("Failed to create user.");
      }
    },
    login: async (
      _parent: unknown,
      { input }: LoginUserArgs
    ): Promise<{
      token: string;
      user: IUserDocument;
    }> => {
      try {
        const user = await User.findOne({ email: input.email });
        if (!user) {
          throw new AuthenticationError("Couldn't find user with this email!");
        }

        const correctPw = await user.isCorrectPassword(input.password);
        if (!correctPw) {
          throw new AuthenticationError("Incorrect password!");
        }

        const token = signToken(user.username, user.email, user._id);
        return { token, user };
      } catch (err) {
        console.error("Error logging in user:", err);
        throw new Error("Login failed. Please try again.");
      }
    },
    addRecipient: async (
      _parent: unknown,
      { input }: AddRecipientArgs,
      context: Context
    ): Promise<IUserDocument | null> => {
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in!");
      }

      try {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { recipientList: input } },
          { new: true, runValidators: true }
        );

        if (!updatedUser) {
          throw new Error("User not found.");
        }

        return updatedUser;
      } catch (err) {
        console.error("Error adding recipient:", err);
        throw new Error("Failed to add recipient.");
      }
    },
    removeRecipient: async (
      _parent: unknown,
      args: RemoveRecipientArgs,
      context: Context
    ): Promise<IUserDocument | null> => {
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in!");
      }

      try {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { recipientList: { recipientId: args.recipientId } } },
          { new: true }
        );

        if (!updatedUser) {
          throw new Error("User not found.");
        }

        return updatedUser;
      } catch (err) {
        console.error("Error deleting recipient:", err);
        throw new Error("Failed to delete recipient.");
      }
    },
    openAIResponse: async (
      _parent: unknown,
      { input }: OpenAIResponseArgs
    ): Promise<string[]> => {
      try {
        // Call promptFunc with the array of recipients
        const responses = await promptFunc(input);
        return responses;
      } catch (err) {
        console.error("Error getting OpenAI response:", err);
        throw new Error(
          `Failed to get OpenAI responses: ${(err as Error).message}`
        );
      }
    },
  },
};

export default resolvers;
