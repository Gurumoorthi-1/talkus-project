import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import { Server } from "socket.io";
import Message from "./models/Message.js";

const app = express();
const server = http.createServer(app);

// Render allows ANY origin (important)
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.use(express.json({ limit: "4mb" }));

export const io = new Server(server, {
  cors: {
    origin: "*",
    credentials: true,
  },
});

export const userSocketMap = {};

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log("User connected:", userId);

  if (userId) userSocketMap[userId] = socket.id;

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("User disconnected:", userId);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// routes
app.get("/", (req, res) => res.send("Server is live"));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

// connect DB
await connectDB();

// render uses process.env.PORT
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log("Server running on PORT:", PORT));

export default server;
