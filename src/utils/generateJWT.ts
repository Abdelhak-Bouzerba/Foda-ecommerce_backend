import Jwt from "jsonwebtoken";


// Function to generate Access Token
export const generateAccessToken = (payload: any) => {
    return Jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET || "default_access_token_secret", {
        expiresIn: "15m",
    });
};

// Function to generate Refresh Token
export const generateRefreshToken = (payload: any) => {
    return Jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET || "default_refresh_token_secret", {
        expiresIn: "7d",
    });
};
