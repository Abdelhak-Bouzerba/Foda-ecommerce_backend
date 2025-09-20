import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import userRouter from './routes/user';
import productRouter from './routes/product';
import orderRouter from './routes/order';
import path from 'path';

dotenv.config();

//initiale the server
const app = express();


//middlewares
app.use(express.json());
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL
}));

// static files for uploaded images
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

//routes
app.use('/api/users', userRouter);
app.use('/api/products', productRouter);
app.use('/api/orders', orderRouter);

export default app;