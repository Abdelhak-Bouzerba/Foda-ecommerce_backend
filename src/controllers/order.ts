import { Request, Response } from "express";
import orderModel from "../models/order";
import productModel from "../models/product";



//update Order Status - Admin
export const updateOrderStatus = async (req: Request, res: Response) => {
    const { status } = req.body;
    const orderId = req.params.id;

    //check if all fields are provided
    if (!status || !orderId) {
        res.status(400).json({ message: 'All fields are required' });
        return;
    }

    //check if order exist
    const order = await orderModel.findById(orderId);
    if (!order) {
        res.status(400).json({ message: 'Order not Found' });
        return;
    }

    //update order status
    order.status = status;
    await order.save();

    //update product stock if order is delivered
    if (status === 'delivred') {
        for (const item of order.items) {
            const product = await productModel.findById(item.productId);
            if (product) {
                product.stock -= item.quantity;
                await product.save();
            } else {
                res.status(400).json({ message: `Product ${item.name} not found` });
                return;
            }
        }
    }

    //send response
    res.status(200).json({ message: `Order ${status} successfully`, order });

}


//Get all Orders - Admin
export const getAllOrders = async (req: Request, res: Response) => {
    const orders = await orderModel.find().populate('userId', 'username phoneNumber');
    res.status(200).json({ orders });
}