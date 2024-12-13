import { gql } from "@apollo/client";

export const ADD_USER = gql`
  mutation addUser($input: NewUserInput!) {
    addUser(input: $input) {
      token
      user {
        _id
        username
        email
        recipientCount
      }
    }
  }
`;

export const LOGIN_USER = gql`
  mutation login($input: LoginUserInput!) {
    login(input: $input) {
      token
      user {
        _id
        username
        email
        recipientCount
      }
    }
  }
`;

export const ADD_RECIPIENT = gql`
  mutation addRecipient($input: AddRecipientInput!) {
    addRecipient(input: $input) {
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

export const OPEN_AI_RESPONSE = gql`
  mutation openAIResponse($input: [RecipientInput]!) {
    openAIResponse(input: $input)
  }
`;

export const REMOVE_RECIPIENT = gql`
  mutation removeRecipient($recipientId: ID!) {
    removeRecipient(recipientId: $recipientId) {
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
