import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetDatabase() {
  await prisma.review.deleteMany({});
  await prisma.book.deleteMany({});
  await prisma.user.deleteMany({});

  await prisma.$executeRaw`ALTER SEQUENCE "User_id_seq" RESTART WITH 1;`;
  await prisma.$executeRaw`ALTER SEQUENCE "Book_id_seq" RESTART WITH 1;`;
  await prisma.$executeRaw`ALTER SEQUENCE "Review_id_seq" RESTART WITH 1;`;
}

export {resetDatabase};
