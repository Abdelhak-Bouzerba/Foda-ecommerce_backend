import mongoose, { Schema, Document, Types } from "mongoose";
import { IItem } from "./cart";

//Order type
interface IOrder extends Document {
    userId: mongoose.Types.ObjectId;
    items: IItem[];
    address: string;
    paymentMethod: 'credit_card' | 'paypal' | 'bank_transfer';
    status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
    totalAmount: number;
}

//Order Schema
const orderSchema = new Schema<IOrder>({
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    items: [{
        productId: { type: Schema.Types.ObjectId, required: true, ref: 'Product' },
        name: { type: String, required: true },
        quantity: { type: Number, required: true, default: 1 },
        price: { type: Number, required: true },
        image: { type: String }
    }],
    address: { type: String, required: true },
    paymentMethod: { type: String, enum: ['credit_card', 'paypal', 'bank_transfer'], required: true },
    status: { type: String, enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'], required: true, default: 'pending' },
    totalAmount: { type: Number, required: true, default: 0 }
},
    { timestamps: true }
);

//Create order model
const orderModel = mongoose.model<IOrder>('Order', orderSchema);
export default orderModel;
