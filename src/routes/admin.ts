import express from 'express';
import { addProduct , updateProduct , deleteProduct } from '../controllers/admin';
import { validateJWT } from '../middlewares/validateJWT';
import { requireRole } from '../middlewares/requireRole';
import asyncHandler from 'express-async-handler';
import { upload } from '../middlewares/uploadImage';

const router = express.Router();

//@desc Add a new Product
//@route POST /api/products/add-product
//@access Private
router.post('/add-product', validateJWT, requireRole('admin'), upload.single('image'), asyncHandler(addProduct));


//@desc Update Product
//@route POST /api/products/update-product
//@access Private
router.put('/update-product/:id', validateJWT, requireRole('admin'), asyncHandler(updateProduct));


//@desc Delete Product
//@route DELETE /api/products/delete-product
//@access Private
router.delete('/delete-product/:id', validateJWT, requireRole('admin'), asyncHandler(deleteProduct));

export default router;