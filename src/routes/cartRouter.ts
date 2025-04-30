import { Router } from 'express';
import { verifyToken } from '../midlewares/auth.js';
import { addToCart, decrementCartItemQuantity, getCartItems, icrementCartItemQuantity, removeCartItem, updateCartItemQuantity } from '../controllers/cartController.js';

const cartRouter = Router();

cartRouter.use(verifyToken)

cartRouter.get('/', getCartItems);
cartRouter.post('/', addToCart);
cartRouter.put('/:bookId', updateCartItemQuantity);
cartRouter.patch('/:bookId/increment', icrementCartItemQuantity);
cartRouter.patch('/:bookId/decrement', decrementCartItemQuantity);
cartRouter.delete('/:bookId', removeCartItem);

export default cartRouter;