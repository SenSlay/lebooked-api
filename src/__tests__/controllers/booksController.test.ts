import express from 'express';
import request from 'supertest';
import prisma from '../../lib/prisma';
import * as fetchModule from '../../utils/fetchGoogleThumbnail';
import {
  getBooks,
  getBookById,
  createBook,
  deleteBook,
} from '../../controllers/booksController';

// Mock prisma methods used in controller
jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: {
    book: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

jest.mock('../../utils/fetchGoogleThumbnail', () => ({
  fetchGoogleThumbnail: jest.fn(),
}));

const mockFindMany = prisma.book.findMany as jest.Mock;
const mockCount = prisma.book.count as jest.Mock;
const mockFindUnique = prisma.book.findUnique as jest.Mock;
const mockCreate = prisma.book.create as jest.Mock;
const mockDelete = prisma.book.delete as jest.Mock;

const app = express();
app.use(express.json());
app.get('/books', getBooks);
app.get('/books/:id', getBookById);
app.post('/books', createBook);
app.delete('/books/:id', deleteBook);

describe('Books Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getBooks', () => {
    it('should return paginated list of books', async () => {
      mockFindMany.mockResolvedValue([
        {
          id: 1,
          title: 'Book A',
          author: 'Author A',
          description: 'desc',
          genres: [],
          tags: [],
        },
      ]);
      mockCount.mockResolvedValue(1);

      const res = await request(app).get('/books');

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.pagination.total).toBe(1);
    });

    it('should return books filtered by genre', async () => {
      mockFindMany.mockResolvedValue([
        { id: 1, title: 'Book A', author: 'Author A', genres: [{ name: 'Fantasy' }], tags: [] }
      ]);
      mockCount.mockResolvedValue(1);
    
      const res = await request(app).get('/books').query({ genre: 'Fantasy' });
    
      expect(res.statusCode).toBe(200);
      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: expect.arrayContaining([
              expect.objectContaining({
                genres: {
                  some: {
                    name: { equals: 'Fantasy', mode: 'insensitive' },
                  },
                },
              }),
            ]),
          }),
        })
      );
      expect(res.body.data[0].genres[0].name).toBe('Fantasy');
    });
    
    it('should return books filtered by tag', async () => {
      mockFindMany.mockResolvedValue([
        { id: 2, title: 'Tagged Book', author: 'Author B', genres: [], tags: [{ name: 'Bestseller' }] }
      ]);
      mockCount.mockResolvedValue(1);
    
      const res = await request(app).get('/books').query({ tag: 'Bestseller' });
    
      expect(res.statusCode).toBe(200);
      expect(res.body.data[0].tags[0].name).toBe('Bestseller');
    });
    
    it('should return books matching search term in title or author', async () => {
      mockFindMany.mockResolvedValue([
        { id: 3, title: 'Amazing Book', author: 'John Doe', genres: [], tags: [] }
      ]);
      mockCount.mockResolvedValue(1);
    
      const res = await request(app).get('/books').query({ search: 'Amazing' });
    
      expect(res.statusCode).toBe(200);
      expect(res.body.data[0].title).toMatch(/amazing/i);
    });

    it('should handle errors gracefully', async () => {
      mockFindMany.mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/books');

      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('error', 'Internal server error');
    });
  });

  describe('getBookById', () => {
    it('should return the book by ID', async () => {
      mockFindUnique.mockResolvedValue({ id: 1, title: 'Book A' });

      const res = await request(app).get('/books/1');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('title', 'Book A');
    });

    it('should return 404 if book not found', async () => {
      mockFindUnique.mockResolvedValue(null);

      const res = await request(app).get('/books/99');
      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({ error: 'Book not found' });
    });

    it('should handle errors', async () => {
      mockFindUnique.mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/books/1');
      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({ error: 'Error fetching book' });
    });
  });

  describe('createBook', () => {
    it('should create a book with a generated image URL', async () => {
      const mockThumbnail = 'http://example.com/image.jpg';
      (fetchModule.fetchGoogleThumbnail as jest.Mock).mockResolvedValue(mockThumbnail);
      mockCreate.mockResolvedValue({ id: 1, title: 'Book A', imageUrl: mockThumbnail });

      const res = await request(app).post('/books').send({
        title: 'Book A',
        author: 'Author A',
        description: 'Desc',
        price: 9.99,
        genres: [],
        tags: [],
      });

      expect(res.statusCode).toBe(200);
      expect(mockCreate).toHaveBeenCalled();
      expect(res.body).toHaveProperty('imageUrl', mockThumbnail);
    });

    it('should create a book with a provided image URL', async () => {
      const imageUrl = 'http://manual.com/image.png';
      mockCreate.mockResolvedValue({ id: 1, title: 'Book B', imageUrl });

      const res = await request(app).post('/books').send({
        title: 'Book B',
        author: 'Author B',
        description: 'Desc',
        price: 5.99,
        genres: [],
        tags: [],
        imageUrl,
      });

      expect(res.statusCode).toBe(200);
      expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ imageUrl }),
      }));
    });

    it('should handle creation errors', async () => {
      mockCreate.mockRejectedValue(new Error('Create error'));

      const res = await request(app).post('/books').send({
        title: 'FailBook',
        author: 'NoOne',
        description: 'Desc',
        price: 1.99,
        genres: [],
        tags: [],
      });

      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({ error: 'Error creating book' });
    });
  });

  describe('deleteBook', () => {
    it('should delete a book by ID', async () => {
      mockDelete.mockResolvedValue({ id: 1, title: 'Book A' });

      const res = await request(app).delete('/books/1');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('id', 1);
    });

    it('should handle deletion errors', async () => {
      mockDelete.mockRejectedValue(new Error('Delete error'));

      const res = await request(app).delete('/books/1');
      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({ error: 'Error deleting book' });
    });
  });
});
