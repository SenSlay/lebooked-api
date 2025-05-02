import { Router } from 'express';
import { login, signup, logout } from '../controllers/authController';
import {
  handleValidationErrors,
  validateSignup,
} from '../middlewares/validation';

const authRouter = Router();

authRouter.post('/login', login);
authRouter.post('/signup', validateSignup, handleValidationErrors, signup);
authRouter.post('/logout', logout);

export default authRouter;
