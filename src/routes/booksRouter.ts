import { Router } from 'express';
import {
  createBook,
  deleteBook,
  getBooks,
  getBookById,
} from '../controllers/booksController';
import { isAdmin, verifyToken } from '../middlewares/auth';

const booksRouter = Router();

booksRouter.get('/', getBooks);
booksRouter.get('/:id', getBookById);
booksRouter.post('/', verifyToken, isAdmin, createBook);
booksRouter.delete('/:id', verifyToken, isAdmin, deleteBook);

export default booksRouter;
