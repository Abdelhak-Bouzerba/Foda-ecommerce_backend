import express from 'express';
import { registerUser , loginUser } from '../controllers/user';
import asyncHandler from 'express-async-handler';

const router = express.Router();

//@desc Register a new user
//@route POST /api/users/register
//@access Public
router.post('/register', asyncHandler(registerUser));


//@desc Login user
//@route POST /api/users/login
//@access Public
router.post('/login', asyncHandler(loginUser));



export default router;