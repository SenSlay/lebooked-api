import { Request, Response } from "express"
import { PrismaClient } from '../../generated/prisma/index.js'
import { fetchGoogleThumbnail } from "../utils/fetchGoogleThumbnail.js";

const prisma = new PrismaClient()

export const getAllBooks = async (req: Request, res: Response) => {
  try {
    const books = await prisma.book.findMany()
    res.json(books);
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).json({ error: "Error fetching books" });
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
    const { title, author, description, price, genre, tags } = req.body;
    
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
        genre,
        tags,
        imageUrl,
      },
    });

    res.status(201).json(newBook);
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