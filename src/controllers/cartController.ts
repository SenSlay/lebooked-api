import { Request, Response } from 'express';
import { body } from 'express-validator';
import prisma from "../lib/prisma";

export const getCartItems = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    };
    
    const cartItems = await prisma.userBook.findMany({
      where: { userId: userId },
      include: {
        book: true,
      },
    });
    
    res.json(cartItems);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const addToCart = async (req: Request, res: Response): Promise<any> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const bookId = parseInt(req.params.bookId);

      if (isNaN(bookId)) {
        return res.status(400).json({ error: 'Invalid bookId' });
      }

      const cartItem = await prisma.userBook.findUnique({
        where: {
          userId_bookId: {
            userId: userId,
            bookId: bookId,
          },
        },
      });

      if (cartItem) {
        // If item exists, update quantity
        await prisma.userBook.update({
          where: {
            userId_bookId: {
              userId: userId,
              bookId: bookId,
            },
          },
          data: {
            quantity: cartItem.quantity + 1,
          },
        });
      } else {
        // If item doesn't exist, create it
        await prisma.userBook.create({
          data: {
            userId: userId,
            bookId: bookId,
            quantity: 1,
          },
        });
      }

      res.json({ message: 'Item added to cart' });
    } catch (error) {
      console.error('Error adding to cart:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
};

export const updateCartItemQuantity = [
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
  async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const bookId = parseInt(req.params.bookId);

    if (isNaN(bookId)) {
      return res.status(400).json({ error: 'Invalid bookId' });
    }

    const { quantity } = req.body;

    await prisma.userBook.update({
      where: {
        userId_bookId: {
          userId: userId,
          bookId: bookId,
        },
      },
      data: {
        quantity: quantity,
      },
    });

    res.json({ message: 'Item quantity updated' });
  } catch (error) {
    console.error('Error updating item quantity:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
];

export const icrementCartItemQuantity = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const bookId = parseInt(req.params.bookId);

    if (isNaN(bookId)) {
      return res.status(400).json({ error: 'Invalid bookId' });
    }

    await prisma.userBook.update({
      where: {
        userId_bookId: {
          userId: userId,
          bookId: bookId,
        },
      },
      data: {
        quantity: { increment: 1 },
      },
    });

    res.json({ message: 'Item quantity incremented' });
  } catch (error) {
    console.error('Error incrementing item quantity:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const decrementCartItemQuantity = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const bookId = parseInt(req.params.bookId);

    if (isNaN(bookId)) {
      return res.status(400).json({ error: 'Invalid bookId' });
    }

    const cartItem = await prisma.userBook.findUnique({
      where: {
        userId_bookId: {
          userId,
          bookId,
        },
      },
    });

    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    // Check if the quantity is greater than 1 before decrementing
    if (cartItem.quantity <= 1) {
      return res.status(400).json({ error: 'Cannot decrement below 1. Use remove instead.' });
    }

    await prisma.userBook.update({
      where: {
        userId_bookId: {
          userId,
          bookId,
        },
      },
      data: {
        quantity: { decrement: 1 },
      },
    });

    res.json({ message: 'Item quantity decremented' });
  } catch (error) {
    console.error('Error decrementing item quantity:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const removeCartItem = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const bookId = parseInt(req.params.bookId);

    if (isNaN(bookId)) {
      return res.status(400).json({ error: 'Invalid bookId' });
    }

    await prisma.userBook.delete({
      where: {
        userId_bookId: {
          userId: userId,
          bookId: bookId,
        },
      },
    });

    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Error removing item from cart:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};