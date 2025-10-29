import { Request, Response } from "express";
import productModel from "../models/product";
import { addProductSchema, updateProductSchema } from "../utils/joiValidate";


//Add a New Product - Admin
export const addProduct = async (req: Request, res: Response) => {
    const { name, price, stock, description, category } = req.body;
    const file = req.file;

    //check if all fields are provided
    if (!name || !price || !stock || !category || !file) {
        res.status(400).json({ message: 'all Fields are required' });
        return;
    }

    //validate info
    const { error } = addProductSchema.validate(req.body);
    if (error) {
        res.status(400).json({ message: error.details[0].message });
        return;
    }

    //check if price > 0 AND stock >= 1
    if (price > 0 && stock < 1) {
        res.status(400).json({ message: 'Price must be greater than 0 and stock must be at least 1' });
        return;
    }

    const fileName = file.filename;

    //add a new product
    const newProduct = await productModel.create({
        name,
        price,
        stock,
        description,
        image: fileName,
        category
    });

    //check if product create successfully
    if (!newProduct) {
        res.status(400).json({ message: 'Fail to Add a New Product' });
        return;
    }

    //save product to database
    await newProduct.save();

    //send response 
    res.status(201).json({ message: 'Add a New Product Successfully', newProduct });

}


//update Product - Admin
export const updateProduct = async (req: Request, res: Response) => {
    const data = req.body;
    const productId = req.params.id;

    //check if updated data and productId are provided
    if (!data || !productId) {
        res.status(400).json({ message: 'No updated data provided' });
        return;
    }

    //validate updated data
    const { error } = updateProductSchema.validate(req.body);
    if (error) {
        res.status(400).json({ message: error.details[0].message });
        return;
    }

    //check if product exist
    const product = await productModel.findById(productId);
    if (!product) {
        res.status(400).json({ message: 'Product not Found' });
        return;
    }

    //update product data
    const updatedProduct = await productModel.findByIdAndUpdate(
        productId,
        {
            $set: data
        },
        {
            new: true
        }
    );

    //save to database
    await updatedProduct?.save();

    //send response 
    res.status(200).json({ message: 'Updated Product Successfully', updatedProduct });

}


//delete Product - Admin
export const deleteProduct = async (req: Request, res: Response) => {
    const productId = req.params.id;

    //check if productId is provided
    if (!productId) {
        res.status(400).json({ message: 'No product id provided' });
        return;
    }

    //check if product exist and delete it
    const product = await productModel.findByIdAndDelete(productId);
    if (!product) {
        res.status(400).json({ message: 'Product not Found' });
        return;
    }

    //send response
    res.status(200).json({ message: 'Deleted Product Successfully' });

}