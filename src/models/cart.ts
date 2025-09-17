import mongoose, { Document, Schema, Types } from "mongoose";

//Item type
export interface IItem {
    productId: Types.ObjectId;
    name: string;
    quantity: number;
    price: number;
}

//Cart type
interface ICart extends Document {
    userId: Types.ObjectId;
    items: IItem[];
    totalPrice: number;
}

//Cart Schema
const cartSchema = new Schema<ICart>({
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    items: [{
        productId: { type: Schema.Types.ObjectId, required: true, ref: 'Product' },
        name: { type: String, required: true },
        quantity: { type: Number, required: true, default: 1 },
        price:{type:Number , required:true},
    }],
    totalPrice: { type: Number, required: true, default: 0 }
},
    { timestamps: true }
);

//Create cart model
const cartModel = mongoose.model<ICart>('Cart', cartSchema);
export default cartModel;