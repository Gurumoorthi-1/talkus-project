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

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json({ limit: "50mb" }));

export const io = new Server(server, {
  pingInterval: 10000,
  cors: {
    origin: true,
    credentials: true,
  },
});

export const userSocketMap = {};


io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log("User connected:", userId);

  if (userId) userSocketMap[userId] = socket.id;

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Update pending messages to 'delivered'
  (async () => {
    try {
      const pendingMessages = await Message.find({ receiverId: userId, status: "sent" });

      if (pendingMessages.length > 0) {
        await Message.updateMany({ receiverId: userId, status: "sent" }, { $set: { status: "delivered" } });

        const sendersToNotify = [...new Set(pendingMessages.map(msg => msg.senderId.toString()))];

        sendersToNotify.forEach(senderId => {
          const senderSocket = userSocketMap[senderId];
          if (senderSocket) {
            io.to(senderSocket).emit("messagesDelivered", { receiverId: userId });
          }
        });
      }
    } catch (error) {
      console.log("Error updating delivered status:", error);
    }
  })();

  socket.on("disconnect", () => {
    console.log("User disconnected:", userId);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });

  socket.on("messagesSeen", async ({ senderId, receiverId }) => {
    const senderSocket = userSocketMap[senderId];
    if (senderSocket) {
      io.to(senderSocket).emit("messagesSeen", { senderId: receiverId });
    }

    await Message.updateMany(
      { senderId: senderId, receiverId: receiverId, status: { $ne: "seen" } },
      { $set: { status: "seen" } }
    );
  });
});



app.use("/api/status", (req, res) => res.send("Server is live"));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

// db connection
await connectDB();
if (process.env.NODE_env !== "production") {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => console.log("Server running on PORT:", PORT));
}

export default server;