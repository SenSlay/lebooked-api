import { Request, Response } from 'express';
import prisma from "../lib/prisma";

export const getAllGenres = async (req: Request, res: Response): Promise<any> => {
  try {
    const genres = await prisma.genre.findMany();
    res.json(genres);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
