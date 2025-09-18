import Jwt from "jsonwebtoken";

const generateJWT = (payload: any) => {
    const secretKey = process.env.JWT_SECRET || "default_secret_key";
    return Jwt.sign(payload, secretKey, {
        expiresIn: "1h",
    });
};

export default generateJWT;