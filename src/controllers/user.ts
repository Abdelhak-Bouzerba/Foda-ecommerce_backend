import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { registerSchema, loginSchema } from "../utils/joiValidate";
import generateJWT from "../utils/generateJWT";
import userModel from "../models/user";
import productModel from "../models/product";
import cartModel from "../models/cart";


//register a new user
export const registerUser = async (req: Request, res: Response) => {
    const { email, phoneNumber, password } = req.body;

    //check if all fields are provided
    if (!email || !phoneNumber || !password) {
        res.status(400).json({ message: 'all the fields are required' });
        return;
    }

    //validate body
    const { error } = registerSchema.validate(req.body);
    if (error) {
        res.status(400).json({ message: error.details[0].message });
        return;
    }

    //check if user already exsit 
    const exsitingUser = await userModel.findOne({ email });
    if (exsitingUser) {
        res.status(400).json({ message: 'User already exsit' });
        return;
    }

    //hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    //create username
    let username = email.substring(0, email.indexOf('@'));
    if (username.length > 10) {
        username = username.substring(0, 10);
    }

    //ensure username is unique
    while (await userModel.findOne({ username })) {
        username = username + Date.now().toString().substring(10);
    }

    //create the new user
    const newUser = await userModel.create({
        username,
        email,
        phoneNumber,
        password: hashedPassword
    });

    //check if user is admin
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail && email === adminEmail) {
        newUser.role = 'admin';
    }

    //save new user to database
    await newUser.save();

    //generate JWT token
    const token = generateJWT({ id: newUser._id, username ,role:newUser.role});

    //send response 
    res.status(201).json({ message: 'registred successfully', token });
}


//login user
export const loginUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    //check if all fields are provided
    if (!email || !password) {
        res.status(400).json({ message: 'all the fields are required' });
        return;
    }

    //validate body
    const { error } = loginSchema.validate(req.body);
    if (error) {
        res.status(400).json({ message: error.details[0].message });
        return;
    }

    //check if user exsit
    const existingUser = await userModel.findOne({ email });
    if (!existingUser) {
        res.status(400).json({ message: 'Invalid credentials' });
        return;
    }

    //compare password
    const isPasswordValid = await bcrypt.compare(password, existingUser.password);
    if (!isPasswordValid) {
        res.status(400).json({ message: 'Invalid credentials' });
        return;
    }

    //generate JWT token
    const token = generateJWT({ id: existingUser._id, username: existingUser.username, role: existingUser.role });

    //send response
    res.status(200).json({ message: 'login successful', token });
}


//get products
export const getProducts = async (req: Request, res: Response) => {
    const products = await productModel.find();

    //check if products exist
    if (!products || products.length === 0) {
        res.status(400).json({ message: "No products Found" });
        return;
    }

    //send response 
    res.status(200).json({ products });
}


//create Cart
export const createCart = async (req: Request, res: Response) => {
    const userId = req.user?.id;

    //check if all fields are provided
    if (!userId) {
        res.status(400).json({ message: 'User id is required' });
        return;
    }

    //check if cart already exsit for the user
    const existingCart = await cartModel.findOne({ userId });
    if (existingCart) {
        res.status(400).json({ message: 'Cart already exists for this user' });
        return;
    }

    //create new cart
    const newCart = await cartModel.create({
        userId,
        items: [],
        totalPrice: 0
    });

    //save new cart to database
    await newCart.save();

    //send response 
    res.status(201).json({ message: 'Cart created successfully', cart: newCart });
}


//Add item to cart
export const addToCart = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const productId = req.body.productId;

    //check if all fields are provided
    if (!userId || !productId) {
        res.status(400).json({ message: 'User id and Product id are required' });
        return;
    }

    //check if cart exsit for the user
    const cart = await cartModel.findOne({ userId });
    if (!cart) {
        res.status(400).json({ message: 'Cart does not exist for this user' });
        return;
    }

    //check if product exist
    const product = await productModel.findById(productId);
    if (!product) {
        res.status(400).json({ message: 'Product does not exist' });
        return;
    }

    //check if item already in cart
    const existingItem = cart.items.find(item => item.productId.toString() === productId);
    if (existingItem) {
        res.status(400).json({ message: 'Item already in cart' });
        return;
    }

    //item info
    const itemInfo = {
        productId: product._id as any,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.image
    };

    //add item to cart
    cart.items.push(itemInfo);

    //update total price
    cart.totalPrice += product.price;

    //save cart to database
    await cart.save();

    //send response
    res.status(200).json({ message: 'Item added to cart successfully', cart });

}


//remove item from cart
export const removeFromCart = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const productId = req.body.productId;

    //check if all fields are provided
    if (!userId || !productId) {
        res.status(400).json({ message: 'User id and Product id are required' });
        return;
    }

    //check if cart exsit for the user
    const cart = await cartModel.findOne({ userId });
    if (!cart) {
        res.status(400).json({ message: 'Cart does not exist for this user' });
        return;
    }

    //check if item in cart
    const exsitingItem = cart.items.find(item => item.productId.toString() === productId);
    if (!exsitingItem) {
        res.status(400).json({ message: 'Item not in cart' });
        return;
    }

    //remove item from cart
    cart.items = cart.items.filter(item => item.productId.toString() !== productId);

    //update total price
    cart.totalPrice -= exsitingItem.price * exsitingItem.quantity;

    //save cart to database
    await cart.save();

    //send response
    res.status(200).json({ message: 'Item removed from cart successfully', cart });
}