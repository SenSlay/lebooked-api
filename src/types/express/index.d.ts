import { AuthPayload } from '../../midlewares/auth.ts';

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}