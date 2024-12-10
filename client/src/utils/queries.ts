import { gql } from "@apollo/client";

export const GET_ME = gql`
  query me {
    me {
      _id
      username
      email
      recipientCount
      recipientList {
        name
        gifts
        recipientId
        budget
        status
      }
    }
  }
`;

// export interface IUserDocument extends Document {
//  id: string;
 // username: string;
 // email: string;
 // password: string;
 // recipientList: RecipientDocument[];
 // isCorrectPassword(password: string): Promise<boolean>;
 // recipientCount: number;
//}

// export interface RecipientDocument extends Document {
// name: string;
// gifts: string[];
// recipientId: string;
// budget: number;
// status: boolean;
//}