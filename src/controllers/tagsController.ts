import { Request, Response } from 'express';
import { PrismaClient } from '../../generated/prisma/index';

const prisma = new PrismaClient();

export const getAllTags = async (req: Request, res: Response): Promise<any> => {
  try {
    const tags = await prisma.tag.findMany();
    res.json(tags);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};