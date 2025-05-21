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

export const validateAIQuery = [
  body('messages')
    .isArray()
    .withMessage('messages must be an array.'),

  body('messages.*.role')
    .isIn(['user', 'assistant'])
    .withMessage('Each message role must be either "user" or "assistant".'),

  body('messages.*.content')
    .isString()
    .notEmpty()
    .withMessage('Each message must have non-empty content.')
    .isLength({ min: 1, max: 300 })
    .withMessage('Message content must be between 1 and 300 characters.')
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
