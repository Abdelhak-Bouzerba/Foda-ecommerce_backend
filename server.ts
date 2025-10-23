import app from './src/app';
import http from 'http';
import { Server } from 'socket.io';
import connectDb from './src/config/db';
import "./src/events/user.events";

//load port from .env file
const port = process.env.PORT || 3000;

// Create HTTP server and Socket.io server
const server = http.createServer(app);
const io = new Server(server);

//connect to database
connectDb();


server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});