import joi from 'joi';

export const registerSchema = joi.object({
    username: joi.string().alphanum().min(3).max(20),
    email: joi.string().email().required(),
    phoneNumber: joi.string().pattern(/^[0-9]{10,15}$/).required(),
    password: joi.string().min(8).required(),
});

export const loginSchema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().min(8).required(),
});