import JWT, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { IUser } from '../models/user';


declare global {
    namespace Express {
        interface Request {
            user?: IUser | JwtPayload;
        }
    }
}

export const validateJWT = (req: Request, res: Response, next: NextFunction) => {
    try {
        //check if authorization header is present
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ message: 'Authorization header missing or malformed' });
            return;
        }

        //extract token from header
        const token = authHeader.split(' ')[1];
        if (!token) {
            res.status(401).json({ message: 'No token provided' });
            return;
        }

        //verify token
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            res.status(500).json({ message: 'Internal server error' });
            return;
        }

        //decode token and attach user to request object
        const decoded = JWT.verify(token, secret);
        req.user = decoded as IUser | JwtPayload;
        next();

    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
        return;
    }
}