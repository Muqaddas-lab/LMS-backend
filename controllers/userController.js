import User from "../models/User.js";
import bcrypt from "bcryptjs";

// CREATE USER
export const createUser = async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      role,
      status,
      accessTill,
      avatar,
      courses = [],
    } = req.body;

    // Validation
    if (!fullName || !email) {
      return res.status(400).json({ message: "Full name and email are required" });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    // Hash password
    const userPassword = password || "Student@123";
    const hashedPassword = await bcrypt.hash(userPassword, 10);

    // Create user
    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      role: role || "Student",
      status: status || "Active",
      accessTill,
      avatar,
      courses,
    });

    res.status(201).json({
      message: "User created successfully",
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        status: user.status,
        accessTill: user.accessTill,
        avatar: user.avatar,
        courses: user.courses,
        createdAt: user.createdAt,
      },
      defaultPassword: !password ? "Student@123" : undefined,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .populate("courses", "title")   // ⭐ YEH LINE SAB SE ZAROORI HAI
      .select("-password");

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate("courses", "title")
      .select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};



// Update User
export const updateUser = async (req, res) => {
  try {
    const { password, courses, ...otherData } = req.body;

    const updatedData = { ...otherData };

    if (password) {
      updatedData.password = await bcrypt.hash(password, 10);
    }

    if (courses) {
      updatedData.courses = courses; // Save selected courses
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    )
      .select("-password")
      .populate("courses", "title");

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Delete User
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
