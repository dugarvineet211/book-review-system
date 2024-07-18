import { resolvers } from '../resolvers';
import { prismaMock } from './prismaClient';
import { mockContext } from './context';

import {resetDatabase} from '../test-setup';


describe('Resolvers', () => {

beforeAll(async () => {
  await resetDatabase();
});
  describe('Mutation', () => {
    it('should register a user', async () => {
      prismaMock.user.findFirst.mockResolvedValue(null);
      prismaMock.user.create.mockResolvedValue({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password: 'password'
      });

      const result = await resolvers.Mutation.register(
        null,
        { username: 'testuser', email: 'test@example.com', password: 'password' },
        { prisma: prismaMock, userId: 1 }
      );

      expect(result).toHaveProperty('token');
    });

    it('should login a user', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password: '$2a$10$EixZaYVK1fsbw1ZfbX3OXe.Px8x9uQe5BSg5G4n6he1k7Rbsa5HT2', // hashed version of 'password'
      });

      const result = await resolvers.Mutation.login(
        null,
        { email: 'test@example.com', password: 'password' },
        { prisma: prismaMock, userId: 1 }
      );

      expect(result).toHaveProperty('token');
    });


    it('should add a book', async () => {
      prismaMock.book.create.mockResolvedValue({
        id: 1,
        title: 'Book 1',
        author: 'Author 1',
        publishedYear: 2020,
      });

      const result = await resolvers.Mutation.addBook(
        null,
        { title: 'Book 1', author: 'Author 1', publishedYear: 2020 },
        mockContext
      );

      expect(result).toEqual({
        id: 1,
        title: 'Book 1',
        author: 'Author 1',
        publishedYear: 2020,
      });
    });

    it('should add a review', async () => {
      prismaMock.review.create.mockResolvedValue({
        id: 1,
        bookId: 1,
        userId: 1,
        rating: 5,
        comment: 'Great book!',
        createdAt: new Date(),
      });

      const result = await resolvers.Mutation.addReview(
        null,
        { bookId: "1", rating: 5, comment: 'Great book!' },
        mockContext
      );

      expect(result).toEqual({
        id: 1,
        bookId: 1,
        userId: 1,
        rating: 5,
        comment: 'Great book!',
        createdAt: expect.any(Date),
      });
    });

    it('should update a review', async () => {
      prismaMock.review.findUnique.mockResolvedValue({
        id: 1,
        userId: 1,
      });

      prismaMock.review.update.mockResolvedValue({
        id: 1,
        bookId: 1,
        userId: 1,
        rating: 4,
        comment: 'Updated comment',
        createdAt: new Date(),
      });

      const result = await resolvers.Mutation.updateReview(
        null,
        { reviewId: "1", rating: 4, comment: 'Updated comment' },
        mockContext
      );

      expect(result).toEqual({
        id: 1,
        bookId: 1,
        userId: 1,
        rating: 4,
        comment: 'Updated comment',
        createdAt: expect.any(Date),
      });
    });

    it('should delete a review', async () => {
      prismaMock.review.findUnique.mockResolvedValue({
        id: 1,
        userId: 1,
      });

      prismaMock.review.delete.mockResolvedValue({
        id: 1,
        bookId: 1,
        userId: 1,
        rating: 4,
        comment: 'Updated comment',
        createdAt: new Date(),
      });

      const result = await resolvers.Mutation.deleteReview(
        null,
        { reviewId: "1" },
        mockContext
      );

      expect(result).toEqual({
        id: 1,
        bookId: 1,
        userId: 1,
        rating: 4,
        comment: 'Updated comment',
        createdAt: expect.any(Date),
      });
    });
  });

  describe('Query', () => {
    it('should return books', async () => {
      prismaMock.book.findMany.mockResolvedValue([
        {
          id: 1,
          title: 'Book 1',
          author: 'Author 1',
          publishedYear: 2020,
          reviews: [],
        },
      ]);

      const result = await resolvers.Query.getBooks(null, { skip: 0, take: 10 }, { prisma: prismaMock, userId: 1 });
      expect(result).toEqual([
        {
          id: 1,
          title: 'Book 1',
          author: 'Author 1',
          publishedYear: 2020,
          reviews: [],
        },
      ]);
    });

    it('should return a book by ID', async () => {
      prismaMock.book.findUnique.mockResolvedValue({
        id: 1,
        title: 'Book 1',
        author: 'Author 1',
        publishedYear: 2020,
        reviews: [],
      });

      const result = await resolvers.Query.getBookById(null, { id: "1" }, { prisma: prismaMock, userId: 1 });

      expect(result).toEqual({
        id: 1,
        title: 'Book 1',
        author: 'Author 1',
        publishedYear: 2020,
        reviews: [],
      });
    });

    it('should search books by title or author', async () => {
      prismaMock.book.findMany.mockResolvedValue([
        {
          id: 1,
          title: 'Book 1',
          author: 'Author 1',
          publishedYear: 2020,
          reviews: [],
        },
      ]);

      const result = await resolvers.Query.searchBooksByAuthorOrBookName(null, { query: 'Book' }, { prisma: prismaMock, userId: 1 });

      expect(result).toEqual([
        {
          id: 1,
          title: 'Book 1',
          author: 'Author 1',
          publishedYear: 2020,
          reviews: [],
        },
      ]);
    });
  });

});
