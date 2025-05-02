import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const validateSignup = [
  body('username')
    .trim()
    .toLowerCase()
    .isString()
    .notEmpty()
    .isLength({ min: 3, max: 100 })
    .withMessage('Username must be at least 3 characters.'),
  body('password')
    .isString()
    .notEmpty()
    .isLength({ min: 6, max: 50 })
    .withMessage('Password must be at least 6 characters.'),
];

export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  next();
};
