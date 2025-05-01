import { Router } from 'express';
import { createBook, deleteBook, getBooks, getBookById } from '../controllers/booksController.js';
import { isAdmin, verifyToken } from '../midlewares/auth.js';

const booksRouter = Router();

booksRouter.get('/', getBooks);
booksRouter.get('/:id', getBookById);
booksRouter.post('/', verifyToken, isAdmin, createBook);
booksRouter.delete('/:id', verifyToken, isAdmin, deleteBook)

export default booksRouter;