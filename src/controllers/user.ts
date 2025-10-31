import { Request, Response } from "express";
import productModel from "../models/product";
import cartModel from "../models/cart";
import orderModel from "../models/order";


//Get products with filters, sorting, and limit
export const getProducts = async (req: Request, res: Response) => {

  const { search, category } = req.query;

  // const limit = parseInt(req.query.limit as string) || 5;
  // const sort = req.query.sort === 'asc' ? 1 : -1;
  // const price = parseFloat(req.query.price as string) || null;
  // const name = req.query.name as string || null;
  // const category = req.query.category as string || null;

  const filter: any = {};
  if (search) filter.$text = { $search: search };
  if (category) filter.category = category;
  const projection = search ? { score: { $meta: "textScore" } } : {};

  const products = await productModel.find(filter, projection)
    .sort(search ? { score: { $meta: "textScore" } } : {})
    .limit(20);

  // const products = await productModel.find()
  //   .sort({ price: sort })
  //   .where(price ? { price: price } : {})
  //   .where(name ? { name: new RegExp(name, 'i') } : {})
  //   .where(category ? { category: category } : {})
  //   .limit(limit);

  //check if products exsit
  if (!products || products.length === 0) {
    res.status(404).json({ message: "No products found" });
    return;
  }

  //send response
  res.status(200).json({ products });
};

//create Cart
export const createCart = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  //check if all fields are provided
  if (!userId) {
    res.status(400).json({ message: "User id is required" });
    return;
  }

  //check if cart already exsit for the user
  const existingCart = await cartModel.findOne({ userId });
  if (existingCart) {
    res.status(400).json({ message: "Cart already exists for this user" });
    return;
  }

  //create new cart
  const newCart = await cartModel.create({
    userId,
    items: [],
    totalPrice: 0,
  });

  //save new cart to database
  await newCart.save();

  //send response
  res.status(201).json({ message: "Cart created successfully", cart: newCart });
};

//Add item to cart
export const addToCart = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const productId = req.body.productId;

  //check if all fields are provided
  if (!userId || !productId) {
    res.status(400).json({ message: "User id and Product id are required" });
    return;
  }

  //check if cart exsit for the user
  const cart = await cartModel.findOne({ userId });
  if (!cart) {
    res.status(400).json({ message: "Cart does not exist for this user" });
    return;
  }

  //check if product exist
  const product = await productModel.findById(productId);
  if (!product) {
    res.status(400).json({ message: "Product does not exist" });
    return;
  }

  //check if item already in cart
  const existingItem = cart.items.find(
    (item) => item.productId.toString() === productId
  );
  if (existingItem) {
    res.status(400).json({ message: "Item already in cart" });
    return;
  }

  //item info
  const itemInfo = {
    productId: product._id as any,
    name: product.name,
    price: product.price,
    quantity: 1,
    image: product.image,
  };

  //add item to cart
  cart.items.push(itemInfo);

  //update total price
  cart.totalPrice += product.price;

  //save cart to database
  await cart.save();

  //send response
  res.status(200).json({ message: "Item added to cart successfully", cart });
};

//remove item from cart
export const removeFromCart = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const productId = req.body.productId;

  //check if all fields are provided
  if (!userId || !productId) {
    res.status(400).json({ message: "User id and Product id are required" });
    return;
  }

  //check if cart exsit for the user
  const cart = await cartModel.findOne({ userId });
  if (!cart) {
    res.status(400).json({ message: "Cart does not exist for this user" });
    return;
  }

  //check if item in cart
  const exsitingItem = cart.items.find(
    (item) => item.productId.toString() === productId
  );
  if (!exsitingItem) {
    res.status(400).json({ message: "Item not in cart" });
    return;
  }

  //remove item from cart
  cart.items = cart.items.filter(
    (item) => item.productId.toString() !== productId
  );

  //update total price
  cart.totalPrice -= exsitingItem.price * exsitingItem.quantity;

  //save cart to database
  await cart.save();

  //send response
  res
    .status(200)
    .json({ message: "Item removed from cart successfully", cart });
};

//create Oredr from cart
export const createOrderFromCart = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { address, paymentMethod } = req.body;

  //check if all fields are provided
  if (!userId) {
    res.status(400).json({ message: "User id is required" });
    return;
  }

  if (!address || !paymentMethod) {
    res
      .status(400)
      .json({ message: "Address and payment method are required" });
    return;
  }

  //check if cart exsit for the user
  const cart = await cartModel.findOne({ userId });
  if (!cart) {
    res.status(400).json({ message: "Cart does not exist for this user" });
    return;
  }

  //check if cart is empty
  if (cart.items.length === 0) {
    res.status(400).json({ message: "Cart is empty" });
    return;
  }

  //check if stock is available for each item in the cart
  for (const item of cart.items) {
    const product = await productModel.findById(item.productId);
    if (!product || product.stock < item.quantity) {
      res
        .status(400)
        .json({ message: `Insufficient stock for product ${item.name}` });
      return;
    }
  }

  //create Order
  const newOrder = await orderModel.create({
    userId,
    items: cart.items,
    address,
    paymentMethod,
    status: "pending",
    totalAmount: cart.totalPrice,
  });

  //save new order to database
  await newOrder.save();

  //clear the cart
  cart.items = [];
  cart.totalPrice = 0;
  await cart.save();

  //send response
  res
    .status(201)
    .json({ message: "Order created successfully", order: newOrder });
};

//Get all user orders
export const getUserOrders = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  //check if all fields are provided
  if (!userId) {
    res.status(400).json({ message: "User id is required" });
    return;
  }

  //get user orders
  const orders = await orderModel.find({ userId });

  //check if orders exist
  if (!orders || orders.length === 0) {
    res.status(400).json({ message: "No orders Found" });
    return;
  }

  //send response
  res.status(200).json({ orders });
};


//Get products by category
export const getProductsByCategory = async (req: Request, res: Response) => {
  const { category } = req.query;

  //check if category is provided
  if (!category) {
    res.status(400).json({ message: "Category is required" });
    return;
  }

  //get products by category
  const products = await productModel.find({ category });

  //check if products exist
  if (!products || products.length === 0) {
    res.status(400).json({ message: "No products Found in this category" });
    return;
  }

  //send response
  res.status(200).json({ products });
}



//get products
// export const getProducts = async (req: Request, res: Response) => {
//   const products = await productModel.find();

//   //check if products exist
//   if (!products || products.length === 0) {
//     res.status(400).json({ message: "No products Found" });
//     return;
//   }

//   //send response
//   res.status(200).json({ products });
// };