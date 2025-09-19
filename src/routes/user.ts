import express from 'express';
import { registerUser, loginUser, getProducts } from '../controllers/user';
import asyncHandler from 'express-async-handler';
import { validateJWT } from '../middlewares/validateJWT';
import { upload } from '../middlewares/uploadImage';

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




export default router;