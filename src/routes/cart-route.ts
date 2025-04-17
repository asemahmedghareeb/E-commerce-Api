import express from "express";
import protectedRoute from "../middlewares/protectedRoute.ts";
import { addToCart, updateQuantity, removeAllFromCart, getAllCartItems } from "../controllers/cart-controller.ts";
import { addToCartValidation } from '../utils/validation.ts';
const router: express.Router = express.Router();
router.use(protectedRoute);
router.get('/', getAllCartItems);
router.post('/', addToCartValidation, addToCart);
router.delete('/remove-cart-items', removeAllFromCart);
router.patch('/:id', updateQuantity);

export default router; 