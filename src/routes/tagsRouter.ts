import { Router } from 'express';
import { getAllTags } from '../controllers/tagsController.js';


const tagsRouter = Router();

tagsRouter.get('/', getAllTags);

export default tagsRouter;