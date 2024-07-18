import { ApolloError } from 'apollo-server';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { Context } from './context.js';
import { hashPassword, createToken } from './utils/utils.js';

//Initializing instance of prisma client
const prisma = new PrismaClient();

export const resolvers = {
    //Queries available in the application
  Query: {
    //gets all books
    getBooks: async (_: any, args: { skip?: number; take?: number; }, mockContext?: unknown) => {
      return prisma.book.findMany({ skip: args.skip, take: args.take, include: {
        reviews: true
      }});
    },
    //gets a single book based on id
    getBook: async (_: any, args: { id: string }, mockContext?: unknown) => {
      if(!args.id) {
        return new ApolloError("Book id is mandatory!", '404');
      }
      return prisma.book.findUnique({ where: { id: Number(args.id) }, include: {
        reviews: true
      } });
    },
    //gets all reviews of a book
    getReviews: async (_: any, args: { bookId: string, skip?: number, take?: number }) => {
      if(!args.bookId) {
        return new ApolloError("Book id is mandatory to fetch reviews!", '404');
      }
      return prisma.review.findMany({ where: { bookId: Number(args.bookId) }, skip: args.skip, take: args.take });
    },
    //gets reviews posted by the logged in user
    getMyReviews: async (_: any, args: { skip?: number, take?: number }, context: Context) => {
      if (!context.userId) 
        throw new ApolloError('You are not authenticated to view the reviews!', '403');
      return prisma.review.findMany({ where: { userId: context.userId }, skip: args.skip, take: args.take });
    },
    // returns books based on search params for title or author
    searchBooks: async (_: any, args: { query: string; }, mockContext?: unknown) => {
        return prisma.book.findMany({
            where: {
              OR: [
                { title: { contains: args.query, mode: 'insensitive' } },
                { author: { contains: args.query, mode: 'insensitive' } },
              ],
            },
            include: {
              reviews: true
            }
          });
      },
  },
// Mutations available in the app
  Mutation: {
    // register a new user with username, email and password
    register: async (_: any, args: { username: string; email: string; password: string; }, mockContext?: unknown) => {
        // check if user with given email already exists
        if(!args.username) {
          return new ApolloError("Username is mandatory!", '404');
        }
        if(!args.email) {
          return new ApolloError("Email is mandatory!", '404');
        }
        if(!args.password) {
          return new ApolloError("Password is mandatory!", '404');
        }
      let userExistsWithGivenEmailOrUsername = await prisma.user.findFirst({
        where: {
            OR: [
                { username: { contains: args.username, mode: 'insensitive' } },
                { email: { contains: args.email, mode: 'insensitive' } },
              ],
        }
      });
      if(userExistsWithGivenEmailOrUsername) {
        throw new ApolloError("User with given email or username already exists!", '401');
      }
      const hashedPassword = await hashPassword(args.password);
      const createdUser = await prisma.user.create({
        data: {
          username: args.username,
          email: args.email,
          password: hashedPassword,
        },
      });
      
      return { token: createToken(createdUser), user: createdUser };
    },
    // login for a registered user
    login: async (_: any, args: { email: string; password: string; }, mockContext?: unknown) => {
      if(!args.email) {
        return new ApolloError("Email is mandatory!", '404');
      }
      if(!args.password) {
        return new ApolloError("Password is mandatory!", '404');
      }
      const user = await prisma.user.findUnique({ where: { email: args.email } });
      // check to see if user exists or not
      if(!user) {
        throw new ApolloError("User with given email not found!", '403');
      }
      // check for correct password
      if (!(await bcrypt.compare(args.password, user.password))) {
        throw new ApolloError('Invalid password! Please try again!', '401');
      }
      return { token: createToken(user), user };
    },
    // add a new book via an authenticated user
    addBook: async (_: any, args: { title: string, author: string, publishedYear: number }, context: Context) => {
      if(!args.title) {
        return new ApolloError("Book title is mandatory!", '404');
      }
      if(!args.author) {
        return new ApolloError("Book title is mandatory!", '404');
      }
      if(!args.publishedYear) {
        return new ApolloError("Book title is mandatory!", '404');
      }
      if (!context.userId) 
        throw new ApolloError('You are not authorized to add books! Please login or signup!', '403');
      return prisma.book.create({ data: args });
    },
    // add a review for a book via an authenticated user
    addReview: async (_: any, args: { bookId: string, rating: number, comment: string }, context: Context) => {
      if(!args.bookId) {
        return new ApolloError("Book id is mandatory!", '404');
      }
      if(!args.rating) {
        return new ApolloError("Rating is mandatory and should be greater than 0!", '404');
      }
      if(!args.comment) {
        return new ApolloError("Comment is mandatory!", '404');
      }
      if (!context.userId) 
        throw new ApolloError('You are not authorized to add reviews! Please login or signup', '403');
      const user = await prisma.user.findUnique({
        where: {
          id: context.userId
        }
      });
      if(!user) {
        throw new ApolloError("User not found! Please try again later!");
      }
      return prisma.review.create({
        data: {
          bookId: Number(args.bookId),
          userId: context.userId,
          rating: args.rating,
          comment: args.comment,
        },
      });
    },
    // update an existing review via an authenticated user
    updateReview: async (_: any, args: { reviewId: string, rating?: number, comment?: string }, context: Context) => {
      if (!context.userId) 
        throw new ApolloError('You are not authorized to update reviews! Please login or signup', '403');
      const user = await prisma.user.findUnique({
        where: {
          id: context.userId
        }
      });
      if(!user) {
        throw new ApolloError("User not found! Please try again later!");
      }
    // find if review exists
      const review = await prisma.review.findUnique({ where: { id: Number(args.reviewId) } });
      if (!review || review.userId !== context.userId) 
        throw new ApolloError('You are not authorized to update this review!', '403');
      let rating = args.rating ? args.rating : review.rating;
      let comment = args.comment ? args.comment : review.comment;
      return prisma.review.update({
        where: { id: Number(args.reviewId) },
        data: { rating: rating, comment: comment },
      });
    }, 
    // delete an existing review via an authenticated user
    deleteReview: async (_: any, args: { reviewId: string }, context: Context) => {
      if(!args.reviewId) {
        throw new ApolloError("Review id is mandatory!", '404');
      }
      if (!context.userId) 
        throw new ApolloError('You are not authorized to delete reviews! Please login or signup', '403');
    // find review to delete
      const review = await prisma.review.findUnique({ where: { id: Number(args.reviewId) } });
      if (!review) 
        throw new ApolloError('Review not available!', '404');
      if(review.userId !== context.userId)
        throw new ApolloError('You are not authorized to delete this review!', '403');
      return prisma.review.delete({ where: { id: Number(args.reviewId) } });
    },
  },
  User: {
    //resolver to find reviews for particular user
    reviews: (parent: { id: number }) => {
      return prisma.review.findMany({ where: { userId: parent.id } });
    },
  },
  Book: {
    //resolver to find review for particular book
    reviews: (parent: { id: number }) => {
      return prisma.review.findMany({ where: { bookId: parent.id } });
    },
  },
  Review: {
     // resolver to find reviews for particular user
    user: (parent: { userId: number }) => {
      return prisma.user.findUnique({ where: { id: parent.userId } });
    },
    // resolver to find reviews for particular books
    book: (parent: { bookId: number }) => {
      return prisma.book.findUnique({ where: { id: parent.bookId } });
    },
  },
};
