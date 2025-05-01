import { Request, Response } from "express"
import { PrismaClient } from '../../generated/prisma/index.js'
import { fetchGoogleThumbnail } from "../utils/fetchGoogleThumbnail.js";

const prisma = new PrismaClient()

// Function to fetch books from the database with pagination, search, and filtering
export const getBooks = async (req: Request, res: Response): Promise<any> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';
    const genre = req.query.genre as string | undefined;
    const tag = req.query.tag as string | undefined;
    const sortBy = (req.query.sortBy as string) || 'title';
    const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'asc';

    const skip = (page - 1) * limit;

    const books = await prisma.book.findMany({
      where: {
        AND: [
          {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { author: { contains: search, mode: 'insensitive' } },
            ],
          },
          genre ? {
            genres: {
              some: {
                name: { equals: genre, mode: 'insensitive' },
              },
            },
          } : {},
          tag ? {
            tags: {
              some: {
                name: { equals: tag, mode: 'insensitive' },
              },
            },
          } : {},
        ],
      },
      include: {
        genres: true,
        tags: true,
      },
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    const totalCount = await prisma.book.count({
      where: {
        AND: [
          {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { author: { contains: search, mode: 'insensitive' } },
            ],
          },
          genre ? {
            genres: {
              some: {
                name: { equals: genre, mode: 'insensitive' },
              },
            },
          } : {},
          tag ? {
            tags: {
              some: {
                name: { equals: tag, mode: 'insensitive' },
              },
            },
          } : {},
        ],
      },
    });

    res.json({
      data: books,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getBookById = async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  try {
    const book = await prisma.book.findUnique({
      where: { id: Number(id) },
    });
    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }
    res.json(book);
  } catch (error) {
    console.error("Error fetching book:", error);
    res.status(500).json({ error: "Error fetching book" });
  }
};

export const createBook = async (req: Request, res: Response): Promise<any> => {
  try {
    const { title, author, description, price, genres, tags } = req.body;
    
    let imageUrl = req.body.imageUrl;
    if (!imageUrl) {
      imageUrl = await fetchGoogleThumbnail(title, author);
    }

    const newBook = await prisma.book.create({
      data: {
        title,
        author,
        description,
        price,
        genres,
        tags,
        imageUrl,
      },
    });

    res.json(newBook);
  } catch (error) {
    console.error("Error creating book:", error);
    res.status(500).json({ error: "Error creating book" });
  }
};

export const deleteBook = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deletedBook = await prisma.book.delete({
      where: { id: Number(id) },
    });
    res.json(deletedBook);
  } catch (error) {
    console.error("Error deleting book:", error);
    res.status(500).json({ error: "Error deleting book" });
  }
};