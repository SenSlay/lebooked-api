import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getAllTags = async (req: Request, res: Response): Promise<any> => {
  try {
    const tags = await prisma.tag.findMany();
    res.json(tags);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error: ' + error });
  }
};
