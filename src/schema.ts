import { gql } from 'apollo-server';

/*file to define schemas and resolvers for different types used in this application
types defined 
1. User
2. Book
3. Review
4. Auth to send token and user information back to user on login
*/
export const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    email: String!
    password: String!
    reviews: [Review]
  }
 
  type Book {
    id: ID!
    title: String!
    author: String!
    publishedYear: Int!
    reviews: [Review]
  }

  type Review {
    id: ID!
    userId: ID!
    bookId: ID!
    rating: Int!
    comment: String!
    createdAt: String!
    user: User!
    book: Book!
  }

  type Query {
    getBooks(skip: Int, take: Int): [Book!]!
    getBook(id: ID!): Book
    getReviews(bookId: ID!, skip: Int, take: Int): [Review]
    getMyReviews(skip: Int, take: Int): [Review]
    searchBooks(query: String!): [Book]
  }

  type Mutation {
    register(username: String!, email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    addBook(title: String!, author: String!, publishedYear: Int!): Book!
    addReview(bookId: ID!, rating: Int!, comment: String!): Review!
    updateReview(reviewId: ID!, rating: Int, comment: String): Review!
    deleteReview(reviewId: ID!): Review!
  }

  type AuthPayload {
    token: String!
    user: User!
  }
`;
