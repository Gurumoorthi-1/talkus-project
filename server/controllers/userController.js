import User from "../models/User.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import { io } from "../server.js";

// SIGNUP
export const signup = async (req, res) => {
  try {
    const { fullName, email, password, bio } = req.body;

    if (!fullName || !email || !password || !bio) {
      return res.json({ success: false, message: "Missing Details" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: "Account already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      bio
    });

    const token = generateToken(newUser._id);

    //  Remove password before sending
    const userWithoutPassword = newUser.toObject();
    delete userWithoutPassword.password;

    res.json({
      success: true,
      user: userWithoutPassword,
      token,
      message: "Account created successfully",
    });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.json({ success: false, message: "User not found" });

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect)
      return res.json({ success: false, message: "Invalid credentials" });

    const token = generateToken(user._id);

    //  Remove password before sending
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    res.json({
      success: true,
      user: userWithoutPassword,
      token,
      message: "Login successful",
    });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// CHECK AUTH
export const checkAuth = (req, res) => {
  res.json({ success: true, user: req.user });
};

// UPDATE PROFILE
export const updateProfile = async (req, res) => {
  try {
    const { profilePic, bio, fullName } = req.body;
    const userId = req.user._id;

    let updateData = { fullName, bio };

    if (profilePic) {
      const upload = await cloudinary.uploader.upload(profilePic);
      updateData.profilePic = upload.secure_url;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true }).select("-password");

    // Real-time update broadcast
    io.emit("userProfileUpdated", updatedUser);

    res.json({ success: true, user: updatedUser });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
