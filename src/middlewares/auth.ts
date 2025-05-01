import { Request, Response, NextFunction } from 'express';
import jwt from "jsonwebtoken";
import 'dotenv/config';

export interface AuthPayload {
  id: number;
  username: string;
  iat: number;
  exp: number;
}

export const verifyToken = (req: Request, res: Response, next: NextFunction): any => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Unauthorized' });
    return 
  }
  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as AuthPayload;
    req.user = decoded; // Attach the decoded token to the request object
    next();
  } catch (error) {
    console.error('Invalid or Expired Token:', error);
    res.status(401).json({ message: 'Forbidden' });
  }
};

export const isAdmin = (req: Request, res: Response, next: NextFunction): any => {
  if (req.user?.username !== 'admin') {
    return res.status(403).json({ message: 'Access denied.' });
  }

  next(); 
};