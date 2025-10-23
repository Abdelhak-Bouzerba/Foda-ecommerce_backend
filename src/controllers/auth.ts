import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { registerSchema, loginSchema } from "../utils/joiValidate";
import generateJWT from "../utils/generateJWT";
import userModel from "../models/user";
import eventBus from "../events/eventBus";


//register a new user
export const registerUser = async (req: Request, res: Response) => {
  const { email, phoneNumber, password } = req.body;

  //check if all fields are provided
  if (!email || !phoneNumber || !password) {
    res.status(400).json({ message: "all the fields are required" });
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
    res.status(400).json({ message: "User already exsit" });
    return;
  }

  //hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  //create username
  let username = email.substring(0, email.indexOf("@"));
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
    password: hashedPassword,
  });

  //check if user is admin
  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail && email === adminEmail) {
    newUser.role = "admin";
  }

  //save new user to database
  await newUser.save();

  //generate JWT token
  const token = generateJWT({ id: newUser._id, username, role: newUser.role });

  //send welcome email to the new user
  eventBus.emit("welcomeEmail", newUser);

  //send response
  res.status(201).json({
    message: "registred successfully",
    newUser: {
      id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      phoneNumber: newUser.phoneNumber,
      role: newUser.role,
    },
    token,
  });
};

//login user
export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  //check if all fields are provided
  if (!email || !password) {
    res.status(400).json({ message: "all the fields are required" });
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
    res.status(400).json({ message: "Invalid credentials" });
    return;
  }

  //compare password
  const isPasswordValid = await bcrypt.compare(password, existingUser.password);
  if (!isPasswordValid) {
    res.status(400).json({ message: "Invalid credentials" });
    return;
  }

  //generate JWT token
  const token = generateJWT({
    id: existingUser._id,
    username: existingUser.username,
    role: existingUser.role,
  });

  //send response
  res.status(200).json({
    message: "login successful",
    user: {
      id: existingUser._id,
      username: existingUser.username,
      email: existingUser.email,
      phoneNumber: existingUser.phoneNumber,
      role: existingUser.role,
    },
    token,
  });
};