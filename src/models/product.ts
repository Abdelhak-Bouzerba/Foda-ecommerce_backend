import mongoose, { Document, Schema } from "mongoose";


interface IProduct extends Document {
    name: string;
    price: number;
    inStock: boolean;
    description?: string;
    stock: number;
    category: | 'electronics' | 'fashion' | 'home' | 'books' | 'sports' | 'other';
}

const productSchema = new Schema<IProduct>({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    inStock: { type: Boolean, required: true },
    description: { type: String },
    stock: { type: Number, required: true },
    category: { type: String, enum: ['electronics', 'fashion', 'home', 'books', 'sports', 'other'], required: true }
}, {
    timestamps: true
});

const productModel = mongoose.model<IProduct>('Product', productSchema);
export default productModel;