import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import authRouter from './routes/auth';
import userRouter from './routes/user';
import productRouter from './routes/product';
import orderRouter from './routes/order';
import path from 'path';
import errorHandler from './middlewares/errorHandler';

dotenv.config();

//initiale the server
const app = express();


//middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL
}));

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// static files for uploaded images
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

//routes
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/products', productRouter);
app.use('/api/orders', orderRouter);


//error handling middleware
app.use(errorHandler);

export default app;