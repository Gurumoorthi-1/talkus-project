import express from "express";
import { protectRoute } from "../middleware/auth.js";
import {
  getUsersForSidebar,
  getMessages,
  markMessageAsSeen,
  sendMessage
} from "../controllers/messageController.js";

const messageRouter = express.Router();

messageRouter.get("/users", protectRoute, getUsersForSidebar);
messageRouter.post("/send/:id", protectRoute, sendMessage);
messageRouter.patch("/seen/:id", protectRoute, markMessageAsSeen); 
messageRouter.get("/:id", protectRoute, getMessages);

export default messageRouter;
