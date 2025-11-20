import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  text: {
    type: String,
    default: ""
  },

  image: {
    type: String,
    default: null
  },

  status: {
    type: String,
    enum: ["sent", "delivered", "seen"],  //  supports double tick logic
    default: "sent"                       //  initial message state
  }

}, { timestamps: true });

const Message = mongoose.model("Message", messageSchema);
export default Message;
