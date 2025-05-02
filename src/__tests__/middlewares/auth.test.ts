import { Request, Response, NextFunction } from 'express';
import { verifyToken, isAdmin, AuthPayload } from '../../middlewares/auth';
import jwt from 'jsonwebtoken';

// Mock jwt.verify
jest.mock('jsonwebtoken');

describe('auth middleware', () => {
  let req: Partial<Request> & { user?: AuthPayload };
  let res: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  describe('verifyToken', () => {
    it('should call next() if token is valid', () => {
      const mockPayload: AuthPayload = {
        id: 1,
        username: 'admin',
        iat: Date.now(),
        exp: Date.now() + 3600,
      };

      (jwt.verify as jest.Mock).mockReturnValue(mockPayload);

      req.headers = {
        authorization: 'Bearer validtoken',
      };

      verifyToken(req as Request, res as Response, next as NextFunction);

      expect(jwt.verify).toHaveBeenCalledWith('validtoken', process.env.JWT_SECRET);
      expect(req.user).toEqual(mockPayload);
      expect(next).toHaveBeenCalled();
    });

    it('should return 401 if token is missing', () => {
      verifyToken(req as Request, res as Response, next as NextFunction);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if token is invalid', () => {
      req.headers = {
        authorization: 'Bearer badtoken',
      };

      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      verifyToken(req as Request, res as Response, next as NextFunction);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Forbidden' });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('isAdmin', () => {
    it('should allow access if username is admin', () => {
      req.user = {
        id: 1,
        username: 'admin',
        iat: Date.now(),
        exp: Date.now() + 3600,
      };

      isAdmin(req as Request, res as Response, next as NextFunction);

      expect(next).toHaveBeenCalled();
    });

    it('should block access if user is not admin', () => {
      req.user = {
        id: 2,
        username: 'user',
        iat: Date.now(),
        exp: Date.now() + 3600,
      };

      isAdmin(req as Request, res as Response, next as NextFunction);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Access denied.' });
      expect(next).not.toHaveBeenCalled();
    });
  });
});