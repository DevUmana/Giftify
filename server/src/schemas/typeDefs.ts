const typeDefs = `
  type User {
    _id: ID!
    username: String!
    email: String!
    addRecipient: [Recipient]
  }

  type Recipient {
    recipientId: ID!
    name: String
    gifts: [Gift]
    status: Boolean
    budget: Number
  }

  type Auth {
    token: ID!
    user: User!
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

  input AddRecipientInput {
    recipientId: ID!
    name: String
    gifts: [Gift]
    status: Boolean
    budget: Number
  }

  type Query {
    me: User
  }

  type Mutation {
    addUser(input: NewUserInput!): Auth
    login(input: LoginUserInput!): Auth
    addRecipient(input: AddRecipientInput!): User
    removeREcipient(recipientId: ID!): User
  }
`;

export default typeDefs;
