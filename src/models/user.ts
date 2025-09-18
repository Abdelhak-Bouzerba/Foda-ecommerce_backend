import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
    email: string;
    username: string;
    phoneNumber: string;
    password: string;
    role: 'user' | 'admin';
}

const userSchema = new Schema<IUser>({
    email: { type: String, required: true, unique: true },
    username: { type: String,required:true ,  unique: true },
    phoneNumber: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' }
},
{ timestamps: true }
);

const userModel = mongoose.model<IUser>('User' , userSchema);
export default userModel;