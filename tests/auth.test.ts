import request from "supertest";
import app from "../src/app";
import { connectToDatabase, clearDatabase, closeConnection , createUser } from "./setup";
import {describe , beforeAll , afterEach , afterAll , it ,expect} from 'vitest';

describe("Authenticated Endpoints", () => {
    beforeAll(async () => {
        await connectToDatabase();
    });

    afterEach(async () => {
        await clearDatabase();
    })

    afterAll(async () => {
        await closeConnection();
    });
    describe('POST /api/users/register', () => {
        it('should registred a new user', async () => {
            const userData = {
                email: "testuser1@example.com",
                phoneNumber: "0654432313",
                username: "testuser1",
                password: "password123"
            };
            const res = await request(app)
                .post("/api/users/register")
                .send(userData);

            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty("newUser");
            expect(res.body).toHaveProperty("token");
            expect(res.body.newUser).toHaveProperty("username", userData.username);
            expect(res.body.newUser).toHaveProperty("email", userData.email);
            expect(res.body.newUser).toHaveProperty("phoneNumber", userData.phoneNumber);
            expect(res.body.newUser).not.toHaveProperty("password");
        }, 10000); // increase timeout to 10 seconds
    });

    describe('POST /api/users/login', () => {
        it('should login an existing user', async () => {
            const loginUser = await createUser();

            const userData = {
                email: loginUser.email,
                password: loginUser.password
            };


            const response = await request(app)
                .post("/api/users/login")
                .send(userData);
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("user");
            expect(response.body).toHaveProperty("token");
            expect(response.body.user).toHaveProperty("email", userData.email);
            expect(response.body.user).not.toHaveProperty("password");
        });
    });
});