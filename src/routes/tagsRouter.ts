import { Router } from 'express';
import { getAllTags } from '../controllers/tagsController';


const tagsRouter = Router();

tagsRouter.get('/', getAllTags);

export default tagsRouter;