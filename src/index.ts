import express from 'express';
const app = express();
import cors from 'cors';
import "dotenv/config";
import booksRouter from './routes/booksRouter.js';

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/books', booksRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`App is listening on port ${PORT}`);
});
