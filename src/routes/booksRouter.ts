import { Router } from 'express';
import { createBook, deleteBook, getAllBooks, getBookById } from '../controllers/booksController.js';

const booksRouter = Router();

booksRouter.get('/', getAllBooks);
booksRouter.get('/:id', getBookById);
booksRouter.post('/', createBook);
booksRouter.delete('/:id', deleteBook)

export default booksRouter;