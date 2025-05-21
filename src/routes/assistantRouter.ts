import express from 'express';
import { handleAssistantQuery } from '../controllers/assistantController';
import { handleValidationErrors, validateAIQuery } from '../middlewares/validation';
const router = express.Router();

router.post('/', validateAIQuery, handleValidationErrors, handleAssistantQuery);

export default router;