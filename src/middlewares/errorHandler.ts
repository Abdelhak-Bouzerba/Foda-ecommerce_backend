import { Request, NextFunction, Response } from "express";
import { extend } from "joi";

export class CustomError extends Error {
    message: string;
    statusCode: number;
    name: string;
    constructor(message: string, statusCode: number , name: string) {
        super();
        this.name = name;
        this.statusCode = statusCode;
        this.message = message;
    }
}



const errorHandler = (err: CustomError, req: Request, res: Response, next: NextFunction) => {
    console.log(err.stack);
    const statusCode = err.statusCode || 500;

    return res.status(statusCode).json({
        status: 'error',
        statusCode,
        message: err.message || 'Internal Server Error',
        name: err.name || 'InternalServerError'
    });
}

export default errorHandler;