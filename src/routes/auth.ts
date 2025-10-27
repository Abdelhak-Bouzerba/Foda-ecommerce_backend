import express from 'express';
import { registerUser, loginUser, generateNewAccessToken , logoutUser  } from '../controllers/auth';
import asyncHandler from 'express-async-handler';

const router = express.Router();


//@desc Register a new user
//@route POST /api/auth/register
//@access Public
router.post('/register', asyncHandler(registerUser));


//@desc Login user
//@route POST /api/auth/login
//@access Public
router.post('/login', asyncHandler(loginUser));


//@desc Refresh Access Token
//@route  GET /api/auth/refresh
//@access Public
router.get('/refresh', asyncHandler(generateNewAccessToken));


//@desc Logout user
//@route POST /api/auth/logout
//@access Public
router.post('/logout', asyncHandler(logoutUser));


export default router;