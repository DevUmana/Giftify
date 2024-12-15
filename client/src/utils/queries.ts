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
        gender
        age
        gifts {
          name
          query
          price
          url
          image
        }
        recipientId
        budget
        status
      }
    }
  }
`;
