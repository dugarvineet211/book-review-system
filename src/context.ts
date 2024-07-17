import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

export interface Context {
  prisma: PrismaClient;
  userId?: number;
}
// middleware function to check if user is authenticated or not
// if user is authenticated, then we set user id in the context to be checked in the resolvers
export const createContext = ({ req }: any): Context => {
  const token = req.headers.authorization || '';
  let userId;

  try {
    const decodedToken: any = jwt.verify(token, JWT_SECRET);
    userId = decodedToken.userId;
  } catch (error) {
    userId = null;
  }

  return {
    prisma,
    userId,
  };
};
