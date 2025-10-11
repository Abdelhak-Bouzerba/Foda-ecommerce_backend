import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import bcrypt from "bcrypt";
import userModel from "../src/models/user"; 

let mongo: MongoMemoryServer;

//before all
export const connectToDatabase = async () => {
    mongo = await MongoMemoryServer.create();
    const uri = mongo.getUri();
    await mongoose.connect(uri);
};

//after each
export const clearDatabase = async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany({});
    }
};

//after all
export const closeConnection = async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongo.stop();
};

//create new user
export const createUser = async () => {
    const plainPassword = "password123";

    // hash password before saving
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const userData = {
        username: "hakou",
        email: "hakou@example.com",
        phoneNumber: "0654432313",
        password: hashedPassword,
    };

    const newUser = await userModel.create(userData);

    // return plain password for login tests
    return {
        id: newUser._id,
        email: newUser.email,
        username: newUser.username,
        phoneNumber: newUser.phoneNumber,
        password: plainPassword, // use plain password for login tests
    };
};

