import { Request, Response, NextFunction } from 'express';


export const requireRole = (role: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (role !== req.user?.role) {
            res.status(403).json({ message: 'forbidden' });
            return;
        }
        next();
    }
}