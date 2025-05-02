import express from 'express';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as prismaModule from '../../generated/prisma/index';
import { login, signup, logout } from '../../controllers/authController';
import prisma from '../../lib/prisma';

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock('jsonwebtoken');

const mockFindUnique = jest.fn();
const mockCreate = jest.fn();

jest.spyOn(prismaModule, 'PrismaClient').mockImplementation(() => {
  return {
    user: {
      findUnique: mockFindUnique,
      create: mockCreate,
    },
  } as any;
});

const app = express();
app.use(express.json());

app.post('/login', login);
app.post('/signup', signup);
app.post('/logout', logout);

describe('Auth Controller', () => {
  afterAll(async () => {
    jest.clearAllMocks();
    await prisma.user.deleteMany({
      where: {
        username: 'testuser',
      },
    });
  });

  describe('POST /signup', () => {
    it('should signup a new user', async () => {
      mockFindUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpass');
      mockCreate.mockResolvedValue({
        id: 1,
        username: 'testuser',
        password: 'hashedpass',
      });
      (jwt.sign as jest.Mock).mockReturnValue('fake-jwt-token');

      const res = await request(app).post('/signup').send({
        username: 'testuser',
        password: 'securepass',
      });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Signup successful');
      expect(res.body).toHaveProperty('token', 'fake-jwt-token');
    });

    it('should fail if username already exists', async () => {
      mockFindUnique.mockResolvedValue({ id: 1, username: 'testuser' });

      const res = await request(app).post('/signup').send({
        username: 'testuser',
        password: 'any',
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'Username already exists');
    });
  });

  describe('POST /login', () => {
    it('should login user with correct credentials', async () => {
      mockFindUnique.mockResolvedValue({
        id: 1,
        username: 'testuser',
        password: 'hashedpass',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('valid-token');

      const res = await request(app).post('/login').send({
        username: 'testuser',
        password: 'securepass',
      });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Login successful');
      expect(res.body).toHaveProperty('token', 'valid-token');
    });

    it('should fail login for invalid username', async () => {
      mockFindUnique.mockResolvedValue(null);

      const res = await request(app).post('/login').send({
        username: 'nonexistent',
        password: 'irrelevant',
      });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('error', 'Invalid username or password');
    });

    it('should fail login for wrong password', async () => {
      mockFindUnique.mockResolvedValue({
        id: 1,
        username: 'testuser',
        password: 'hashedpass',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const res = await request(app).post('/login').send({
        username: 'testuser',
        password: 'wrongpass',
      });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('error', 'Invalid username or password');
    });
  });

  describe('POST /logout', () => {
    it('should respond with logout message', async () => {
      const res = await request(app).post('/logout');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Logout successful');
    });
  });
});
