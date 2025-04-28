import { Router } from 'express';
import { login, signup, logout } from '../controllers/authController.js';
import { handleValidationErrors, validateSignup } from '../midlewares/validation.js';

const authRouter = Router();

authRouter.post('/login', login);
authRouter.post('/signup', validateSignup, handleValidationErrors, signup);
authRouter.post('/logout', logout);

export default authRouter;

