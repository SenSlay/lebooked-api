import { Request, Response } from 'express';
import { PrismaClient } from '../../generated/prisma/index';

const prisma = new PrismaClient();

export const getAllGenres = async (req: Request, res: Response): Promise<any> => {
  try {
    const genres = await prisma.genre.findMany();
    res.json(genres);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
