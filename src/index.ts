import express from 'express';
const app = express();
import cors from 'cors';
import "dotenv/config";
import booksRouter from './routes/booksRouter.js';
import authRouter from './routes/authRouter.js';
import cartRouter from './routes/cartRouter.js';
import tagsRouter from './routes/tagsRouter.js';
import genresRouter from './routes/genresRouter.js';

app.use(cors({
  origin: process.env.CLIENT_ORIGIN,
  credentials: true,
}));;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/books', booksRouter);
app.use('/api/auth', authRouter);
app.use('/api/cart', cartRouter);
app.use('/api/genres', genresRouter);
app.use('/api/tags', tagsRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`App is listening on port ${PORT}`);
});
