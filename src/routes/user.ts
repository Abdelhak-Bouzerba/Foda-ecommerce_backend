import express from 'express';
import { getProducts, createCart, addToCart, removeFromCart, getUserOrders, getProductsByCategory } from '../controllers/user';
import asyncHandler from 'express-async-handler';
import { validateJWT } from '../middlewares/validateJWT';
import { requireRole } from '../middlewares/requireRole';
import { createOrderFromCart } from '../controllers/user';
import { generateNewAccessToken } from '../utils/generateJWT';

const router = express.Router();


//@desc Get products
//@route  GET /api/users/get-products
//@access Public
router.get('/get-products', asyncHandler(getProducts));


//@desc Create Cart for user
//@route  POST /api/users/create-cart
//@access Private
router.post('/create-cart', validateJWT, requireRole('user'), asyncHandler(createCart));


//@desc Add item to cart
//@route  POST /api/users/add-to-cart
//@access Private
router.post('/add-to-cart', validateJWT, requireRole('user'), asyncHandler(addToCart));


//@desc Remove item from cart
//@route  POST /api/users/remove-from-cart
//@access Private
router.delete('/remove-from-cart', validateJWT, requireRole('user'), asyncHandler(removeFromCart));


//@desc Create Order
//@route  POST /api/users/create-order
//@access Private
router.post('/create-order', validateJWT, requireRole('user'), asyncHandler(createOrderFromCart));


//@desc Get user orders
//@route  GET /api/users/get-orders
//@access Private
router.get('/get-orders', validateJWT, requireRole('user'), asyncHandler(getUserOrders));


//@desc Get products by category
//@route  GET /api/users/get-products-by-category?category=<category>
//@access Public
router.get('/get-products-by-category', asyncHandler(getProductsByCategory));




export default router;