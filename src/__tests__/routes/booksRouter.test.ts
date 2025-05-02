import { jest } from '@jest/globals';
import { describe, it, expect, beforeAll } from '@jest/globals';
import request from 'supertest';
import express, { Express } from 'express';
import type { Request, Response, NextFunction } from 'express';

// Explicitly cast to middleware function type
jest.mock('../../middlewares/auth', () => ({
  verifyToken: jest.fn((req: Request, res: Response, next: NextFunction) =>
    next()
  ) as jest.Mock,
  isAdmin: jest.fn((req: Request, res: Response, next: NextFunction) =>
    next()
  ) as jest.Mock,
}));

// Mock controller functions
jest.mock('../../controllers/booksController', () => ({
  getBooks: (req, res) => res.status(200).json([{ id: 1, title: 'Book 1' }]),
  getBookById: (req, res) =>
    res.status(200).json({ id: Number(req.params.id) }),
  createBook: (req, res) => res.status(201).json({ message: 'Book created' }),
  deleteBook: (req, res) => res.status(200).json({ message: 'Book deleted' }),
}));

import booksRouter from '../../routes/booksRouter';

let app: Express;

beforeAll(() => {
  app = express();
  app.use(express.json());
  app.use('/books', booksRouter);
});

describe('Books Routes', () => {
  describe('GET /books', () => {
    it('should return a list of books', async () => {
      const res = await request(app).get('/books');
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(expect.any(Array));
    });
  });

  describe('GET /books/:id', () => {
    it('should return the book with the specified ID', async () => {
      const res = await request(app).get('/books/1');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('id', 1);
    });
  });

  describe('POST /books', () => {
    it('should allow admin to create a new book', async () => {
      const newBook = { title: 'New Book', author: 'Author A' };
      const res = await request(app).post('/books').send(newBook);
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('message', 'Book created');
    });

    it('should block non-admin users from creating a book', async () => {
      require('../../middlewares/auth').isAdmin.mockImplementationOnce(
        (req, res) => {
          res.status(401).json({ message: 'Forbidden' });
        }
      );

      const newBook = { title: 'Another Book', author: 'Author B' };
      const res = await request(app).post('/books').send(newBook);
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Forbidden');
    });
  });

  describe('DELETE /books/:id', () => {
    it('should allow admin to delete a book', async () => {
      const res = await request(app).delete('/books/123');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Book deleted');
    });

    it('should block non-admin users from deleting a book', async () => {
      require('../../middlewares/auth').isAdmin.mockImplementationOnce(
        (req, res) => {
          res.status(401).json({ message: 'Forbidden' });
        }
      );

      const res = await request(app).delete('/books/123');
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Forbidden');
    });
  });
});
