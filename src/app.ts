import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import userRouter from './routes/user';
import adminRouter from './routes/admin';
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
app.use('/api/products', adminRouter);


export default app;