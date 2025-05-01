import { AuthPayload } from '../../middlewares/auth';

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}