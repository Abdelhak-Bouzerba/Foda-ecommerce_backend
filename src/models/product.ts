import mongoose, { Document, Schema } from "mongoose";


interface IProduct extends Document {
    name: string;
    image: string;
    price: number;
    inStock?: boolean;
    description?: string;
    stock: number;
    category: | 'electronics' | 'fashion' | 'home' | 'books' | 'sports' | 'phones';
}

const productSchema = new Schema<IProduct>({
    name: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    inStock: { type: Boolean },
    description: { type: String },
    stock: { type: Number, required: true },
    category: { type: String, enum: ['electronics', 'fashion', 'home', 'books', 'sports', 'phones'], required: true }
}, {
    timestamps: true
});

// Create text index for name and description to enhance search capabilities
productSchema.index({ name: 'text', description: 'text' });

const productModel = mongoose.model<IProduct>('Product', productSchema);
export default productModel;