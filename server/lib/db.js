import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () =>
      console.log("MongoDB Connected")
    );

    await mongoose.connect(`${process.env.MONGODB_URI}/chat-app`);
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
  }
};
