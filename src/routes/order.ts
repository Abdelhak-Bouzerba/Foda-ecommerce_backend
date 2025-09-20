import express from 'express';
import { updateOrderStatus , getAllOrders } from '../controllers/order';
import asyncHandler from 'express-async-handler';
import { validateJWT } from '../middlewares/validateJWT';
import { requireRole } from '../middlewares/requireRole';

const router = express.Router();

//@desc Update Order Status - Admin
//@route PUT /api/orders/:id/status
//@access Private
router.put('/:id/status', validateJWT, requireRole('admin'), asyncHandler(updateOrderStatus));


//@desc Get all Orders - Admin
//@route GET /api/orders/get-all-orders
//@access Private
router.get('/get-all-orders', validateJWT, requireRole('admin'), asyncHandler(getAllOrders));
export default router;