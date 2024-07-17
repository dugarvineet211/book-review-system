import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const mockContext = {
  prisma: prisma,
  userId: 1, // Example user ID for authenticated tests
};

export { mockContext };
