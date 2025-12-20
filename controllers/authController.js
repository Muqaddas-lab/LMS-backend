// controllers/authController.js
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

// REGISTER CONTROLLER
export const register = async (req, res, next) => {
  try {
    const { fullName, email, password, confirmPassword, role } = req.body;

    // Check required fields
    if (!fullName || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Create new user
    const user = new User({ fullName, email, password, role });
    user.confirmPassword = confirmPassword; // virtual field

    await user.save(); // Mongoose will validate confirmPassword automatically

    // Generate JWT token
    const token = generateToken(user._id, user.role);

    // ✅ FIXED RESPONSE
    res.status(201).json({
      success: true,
      token: token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// LOGIN CONTROLLER
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check required fields
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate token
    const token = generateToken(user._id, user.role);

    // ✅ FIXED RESPONSE
    res.status(200).json({
      success: true,
      token: token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};