const typeDefs = `
  scalar JSON

  type User {
    _id: ID!
    username: String!
    email: String!
    recipientCount: Int
    recipientList: [Recipient]
  }

  type Recipient {
    name: String
    gender: String
    age: Int
    gifts: [Gift!]
    recipientId: ID!
    budget: Float
    status: Boolean
  }

  type Gift {
    name: String!
    query: String!
    price: Float!
    url: String!
    image: String!
  }

  type Auth {
    token: ID!
    user: User!
  }

  type Product {
    name: String!
    query: String!
    details: JSON
  }

  type RecipientResponse {
    recipientId: String!
    products: [Product!]!
  }
  
  input NewUserInput {
    username: String!
    email: String!
    password: String!
  }

  input LoginUserInput {
    email: String!
    password: String!
  }

  input RecipientInput {
    name: String
    gender: String
    age: Int
    gifts: [GiftInput]
    recipientId: ID!
    budget: Float
    status: Boolean
  }

  input GiftInput {
    name: String!
    query: String!
    price: Float!
    url: String!
    image: String!
  }

  input RecipientResponseInput {
    recipientId: String!
    gifts: [GiftInput!]
    status: Boolean
  }

  type Query {
    me: User
  }

  type Mutation {
    addUser(input: NewUserInput!): Auth
    login(input: LoginUserInput!): Auth
    addRecipient(input: RecipientInput!): User
    removeRecipient(recipientId: ID!): User
    openAIResponse(input: [RecipientInput]!): [RecipientResponse!]!
    updateRecipientStatus(input: RecipientResponseInput!): User
    removeGiftFromRecipient(recipientId: ID!, giftIndex: Int!): User
  }
`;

export default typeDefs;
