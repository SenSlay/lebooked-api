import express, { Request, Response } from 'express';
import request from 'supertest';
import {
  validateSignup,
  handleValidationErrors,
} from '../../middlewares/validation';

const app = express();
app.use(express.json());

// Dummy route to test validation middleware
app.post(
  '/test-signup',
  validateSignup,
  handleValidationErrors,
  (req: Request, res: Response) => {
    res.status(200).json({ message: 'Signup valid' });
  }
);

describe('Signup validation middleware', () => {
  it('should allow valid signup data', async () => {
    const res = await request(app).post('/test-signup').send({
      username: 'validuser',
      password: 'strongpass123',
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Signup valid');
  });

  it('should reject short username', async () => {
    const res = await request(app).post('/test-signup').send({
      username: 'ab',
      password: 'strongpass123',
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.errors[0]).toHaveProperty(
      'msg',
      'Username must be at least 3 characters.'
    );
  });

  it('should reject short password', async () => {
    const res = await request(app).post('/test-signup').send({
      username: 'validuser',
      password: '123',
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.errors[0]).toHaveProperty(
      'msg',
      'Password must be at least 6 characters.'
    );
  });

  it('should reject missing fields', async () => {
    const res = await request(app).post('/test-signup').send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          msg: 'Username must be at least 3 characters.',
        }),
        expect.objectContaining({
          msg: 'Password must be at least 6 characters.',
        }),
      ])
    );
  });
});
