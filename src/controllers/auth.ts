import { Request, Response } from "express";
import bcrypt from "bcrypt";
import Jwt from "jsonwebtoken";
import { registerSchema, loginSchema } from "../utils/joiValidate";
import  {generateAccessToken  , generateRefreshToken} from "../utils/generateJWT";
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

  //generate Access token and Refresh token
  const accessToken = generateAccessToken({ id: newUser._id, username, role: newUser.role });
  const refreshToken = generateRefreshToken({ id: newUser._id, username, role: newUser.role });

  //store refresh token in a cookie
  res.cookie("refreshToken", refreshToken, {
    secure: process.env.NODE_ENV !== "development" ? true : false,
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "development" ? "lax" : "none",
    maxAge: 7 * 24 * 60 * 60 * 1000, //7 days
  });

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
    accessToken,
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

  //generate Access token and Refresh token
  const accessToken = generateAccessToken({
    id: existingUser._id,
    username: existingUser.username,
    role: existingUser.role,
  });
  const refreshToken = generateRefreshToken({
    id: existingUser._id,
    username: existingUser.username,
    role: existingUser.role,
  });

  //store refresh token in cookie
  res.cookie("refreshToken", refreshToken, {
    secure: process.env.NODE_ENV !== "development" ? true : false,
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "development" ? "lax" : "none",
    maxAge: 7 * 24 * 60 * 60 * 1000, //7 days
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
    accessToken,
  });
};

//Generate new access token using refresh token
export const generateNewAccessToken = (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    res.sendStatus(401);
    return;
  }

  try {
    Jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET || "default_refresh_token_secret", (err: any, user: any) => {
      if (err) {
        res.sendStatus(403);
        return;
      }

      const accessToken = generateAccessToken(user);
      res.json({ accessToken });
    });
  } catch (error) {
    res.sendStatus(500);
  }
};

//Logout user
export const logoutUser = (req: Request, res: Response) => {

  if(!req.cookies.refreshToken){
    res.status(400).json({ message: "No refresh token found" });
    return;
  }
  res.clearCookie("refreshToken");
  res.status(200).json({ message: "Logout successful" });
};