import express from 'express';
import { registerUser, loginUser, getProducts, createCart, addToCart, removeFromCart } from '../controllers/user';
import asyncHandler from 'express-async-handler';
import { validateJWT } from '../middlewares/validateJWT';
import { upload } from '../middlewares/uploadImage';
import { requireRole } from '../middlewares/requireRole';

const router = express.Router();

//@desc Register a new user
//@route POST /api/users/register
//@access Public
router.post('/register', asyncHandler(registerUser));


//@desc Login user
//@route POST /api/users/login
//@access Public
router.post('/login', asyncHandler(loginUser));


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




export default router;