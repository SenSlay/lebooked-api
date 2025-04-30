import { Router } from 'express';
import { createBook, deleteBook, getAllBooks, getBookById } from '../controllers/booksController.js';
import { isAdmin, verifyToken } from '../midlewares/auth.js';

const booksRouter = Router();

booksRouter.get('/', getAllBooks);
booksRouter.get('/:id', getBookById);
booksRouter.post('/', verifyToken, isAdmin, createBook);
booksRouter.delete('/:id', verifyToken, isAdmin, deleteBook)

export default booksRouter;