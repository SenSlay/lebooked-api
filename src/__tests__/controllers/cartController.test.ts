import express from 'express';
import request from 'supertest';
import prisma from '../../lib/prisma';
import {
  getCartItems,
  addToCart,
  updateCartItemQuantity,
  icrementCartItemQuantity,
  decrementCartItemQuantity,
} from '../../controllers/cartController';

// Mock prisma methods
jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: {
    userBook: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      upsert: jest.fn()
    },
  },
}));

const mockFindMany = prisma.userBook.findMany as jest.Mock;
const mockFindUnique = prisma.userBook.findUnique as jest.Mock;
const mockCreate = prisma.userBook.create as jest.Mock;
const mockUpdate = prisma.userBook.update as jest.Mock;
const mockUpsert = prisma.userBook.upsert as jest.Mock;

// Express app setup
const app = express();
app.use(express.json());

// Simulate auth middleware to set `req.user`
app.use((req, res, next) => {
  req.user = {
    id: 1,
    username: 'testuser',
    iat: Date.now(),
    exp: Date.now() + 1000,
  };
  next();
});

app.get('/cart', getCartItems);
app.post('/cart/:bookId', addToCart);
app.put('/cart/:bookId', updateCartItemQuantity[1]); // index 1 is the actual handler
app.patch('/cart/:bookId/increment', icrementCartItemQuantity);
app.patch('/cart/:bookId/decrement', decrementCartItemQuantity);

describe('Cart Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getCartItems', () => {
    it('should return cart items for logged-in user', async () => {
      mockFindMany.mockResolvedValue([
        {
          userId: 1,
          bookId: 10,
          quantity: 1,
          book: { id: 10, title: 'Book A' },
        },
      ]);

      const res = await request(app).get('/cart');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0]).toHaveProperty('book');
    });

    it('should return 500 on error', async () => {
      mockFindMany.mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/cart');

      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('error', 'Internal server error');
    });
  });

  describe('addToCart', () => {
    it('should increase quantity if item already exists in cart', async () => {
      mockFindUnique.mockResolvedValue({ quantity: 2 });
      mockUpdate.mockResolvedValue({});

      const res = await request(app).post('/cart/5');

      expect(mockUpdate).toHaveBeenCalledWith({
        where: { userId_bookId: { userId: 1, bookId: 5 } },
        data: { quantity: 3 },
      });
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ message: 'Item added to cart' });
    });

    it('should create new item if not in cart', async () => {
      mockFindUnique.mockResolvedValue(null);
      mockCreate.mockResolvedValue({});

      const res = await request(app).post('/cart/7');

      expect(mockCreate).toHaveBeenCalledWith({
        data: {
          userId: 1,
          bookId: 7,
          quantity: 1,
        },
      });
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ message: 'Item added to cart' });
    });

    it('should return 400 if bookId is invalid', async () => {
      const res = await request(app).post('/cart/invalid');

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'Invalid bookId');
    });

    it('should return 500 on internal error', async () => {
      mockFindUnique.mockRejectedValue(new Error('DB error'));

      const res = await request(app).post('/cart/10');

      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('error', 'Internal server error');
    });
  });

  describe('updateCartItemQuantity', () => {
    it('should update quantity if input is valid', async () => {
      mockUpsert.mockResolvedValue({});

      const res = await request(app).put('/cart/5').send({ quantity: 4 });

      expect(mockUpsert).toHaveBeenCalledWith({
        where: { userId_bookId: { userId: 1, bookId: 5 } },
        update: { quantity: 4 },
        create: { userId: 1, bookId: 5, quantity: 4 },
      });
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ message: 'Item quantity updated' });
    });

    it('should return 400 for invalid bookId', async () => {
      const res = await request(app).put('/cart/invalid').send({ quantity: 4 });
      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({ error: 'Invalid bookId' });
    });

    it('should return 500 on DB error', async () => {
      mockUpsert.mockRejectedValue(new Error('DB error'));
      const res = await request(app).put('/cart/5').send({ quantity: 4 });
      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({ error: 'Internal server error' });
    });
  });

  describe('icrementCartItemQuantity', () => {
    it('should increment quantity', async () => {
      mockUpdate.mockResolvedValue({});

      const res = await request(app).patch('/cart/3/increment');

      expect(mockUpdate).toHaveBeenCalledWith({
        where: { userId_bookId: { userId: 1, bookId: 3 } },
        data: { quantity: { increment: 1 } },
      });
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ message: 'Item quantity incremented' });
    });

    it('should return 400 for invalid bookId', async () => {
      const res = await request(app).patch('/cart/invalid/increment');
      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({ error: 'Invalid bookId' });
    });

    it('should return 500 on DB error', async () => {
      mockUpdate.mockRejectedValue(new Error('DB error'));
      const res = await request(app).patch('/cart/3/increment');
      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({ error: 'Internal server error' });
    });
  });

  describe('decrementCartItemQuantity', () => {
    it('should decrement quantity if above 1', async () => {
      mockFindUnique.mockResolvedValue({ quantity: 2 });
      mockUpdate.mockResolvedValue({});

      const res = await request(app).patch('/cart/3/decrement');

      expect(mockUpdate).toHaveBeenCalledWith({
        where: { userId_bookId: { userId: 1, bookId: 3 } },
        data: { quantity: { decrement: 1 } },
      });
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ message: 'Item quantity decremented' });
    });

    it('should return 400 if quantity is 1 or less', async () => {
      mockFindUnique.mockResolvedValue({ quantity: 1 });

      const res = await request(app).patch('/cart/3/decrement');
      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({
        error: 'Cannot decrement below 1. Use remove instead.',
      });
    });

    it('should return 404 if cart item not found', async () => {
      mockFindUnique.mockResolvedValue(null);

      const res = await request(app).patch('/cart/3/decrement');
      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({ error: 'Cart item not found' });
    });

    it('should return 500 on DB error', async () => {
      mockFindUnique.mockRejectedValue(new Error('DB error'));

      const res = await request(app).patch('/cart/3/decrement');
      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({ error: 'Internal server error' });
    });
  });
});
