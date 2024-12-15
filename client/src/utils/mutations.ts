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
  mutation addRecipient($input: RecipientInput!) {
    addRecipient(input: $input) {
      _id
      username
      email
      recipientCount
      recipientList {
        name
        gender
        age
        gifts
        recipientId
        budget
        status
      }
    }
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
        gender
        age
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

export const UPDATE_RECIPIENT = gql`
  mutation updateRecipientStatus($input: RecipientInput!) {
    updateRecipientStatus(input: $input) {
      _id
      username
      email
      recipientCount
      recipientList {
        name
        gender
        age
        gifts
        recipientId
        budget
        status
      }
    }
  }
`;

export const REMOVE_GIFT = gql`
  mutation removeGiftFromRecipient($recipientId: ID!, $giftIndex: Int!) {
    removeGiftFromRecipient(recipientId: $recipientId, giftIndex: $giftIndex) {
      _id
      username
      email
      recipientCount
      recipientList {
        name
        gender
        age
        gifts
        recipientId
        budget
        status
      }
    }
  }
`;
