import { Router } from 'express';
import { getAllGenres } from '../controllers/genresController.js';

const genresRouter = Router();

genresRouter.get('/', getAllGenres);

export default genresRouter;