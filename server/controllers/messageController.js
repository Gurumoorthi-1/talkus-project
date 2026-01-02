import Message from "../models/Message.js";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";
import { io, userSocketMap } from "../server.js";

//Get Users
export const getUsersForSidebar = async (req, res) => {
  try {
    const userId = req.user._id;
    const users = await User.find({ _id: { $ne: userId } }).select("-password");

    const unseenMessages = {};
    for (const user of users) {
      const count = await Message.countDocuments({
        senderId: user._id,
        receiverId: userId,
        status: { $ne: "seen" }
      });
      unseenMessages[user._id] = count;
    }

    res.json({ success: true, users, unseenMessages });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};


export const getMessages = async (req, res) => {
  try {
    const selectedUserId = req.params.id;
    const loggedUserId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: loggedUserId, receiverId: selectedUserId },
        { senderId: selectedUserId, receiverId: loggedUserId }
      ]
    }).sort({ createdAt: 1 });

    //  Mark messages as seen
    await Message.updateMany(
      { senderId: selectedUserId, receiverId: loggedUserId, status: { $ne: "seen" } },
      { $set: { status: "seen" } }
    );

    //  Notify Sender Live
    const senderSocket = userSocketMap[selectedUserId];
    if (senderSocket) {
      io.to(senderSocket).emit("messagesSeen", { senderId: loggedUserId });
    }

    res.json({ success: true, messages });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//  Optional Manual Seen
export const markMessageAsSeen = async (req, res) => {
  try {
    const { id } = req.params;
    await Message.updateMany({ senderId: id }, { status: "seen" });
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//  Send Message
export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const receiverId = req.params.id;
    const senderId = req.user._id;

    let imageUrl = null;
    if (image) {
      const upload = await cloudinary.uploader.upload(image);
      imageUrl = upload.secure_url;
    }

    const newMessage = await Message.create({ senderId, receiverId, text, image: imageUrl });

    const receiverSocket = userSocketMap[receiverId];
    if (receiverSocket) {
      newMessage.status = "delivered";
      await newMessage.save();
      io.to(receiverSocket).emit("newMessage", newMessage);
    }

    res.json({ success: true, newMessage });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
