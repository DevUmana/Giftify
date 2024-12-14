const typeDefs = `
  type User {
    _id: ID!
    username: String!
    email: String!
    recipientCount: Int
    recipientList: [Recipient]
  }

  type Recipient {
    recipientId: ID!
    name: String
    gifts: [String]
    budget: Float
    status: Boolean
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
    gifts: [String]
    budget: Float
    status: Boolean
  }

  input RecipientInput {
    name: String! 
    gifts: [String]
    budget: Float!
    status: Boolean
  }

  input UpdateRecipientInput {
    recipientId: ID! 
    name: String
    gifts: [String]
    budget: Float
    status: Boolean
  }

  type Query {
    me: User
  }

  type Mutation {
    addUser(input: NewUserInput!): Auth
    login(input: LoginUserInput!): Auth
    addRecipient(input: AddRecipientInput!): User
    removeRecipient(recipientId: ID!): User
    openAIResponse(input: [RecipientInput]!): [String]! 
    updateRecipientStatus(input: UpdateRecipientInput!): User 
  }
`;

export default typeDefs;
