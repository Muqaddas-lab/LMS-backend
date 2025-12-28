import Message from "../models/Message.js";
import User from "../models/User.js";

/* ================= SEND MESSAGE ================= */
export const sendMessage = async (req, res) => {
  try {
    const { to, text } = req.body;

    if (!to || !text) {
      return res.status(400).json({
        success: false,
        message: "Receiver and text are required",
      });
    }

    const receiverUser = await User.findById(to).select("fullName role");
    if (!receiverUser) {
      return res.status(404).json({
        success: false,
        message: "Receiver not found",
      });
    }

    const senderRole = Array.isArray(req.user.role)
      ? req.user.role[0]
      : req.user.role;

    const receiverRole = Array.isArray(receiverUser.role)
      ? receiverUser.role[0]
      : receiverUser.role;

    // ❌ student → student not allowed
    if (
      senderRole.toLowerCase() === "student" &&
      receiverRole.toLowerCase() === "student"
    ) {
      return res.status(403).json({
        success: false,
        message: "Students cannot message each other",
      });
    }

    // ❌ admin → admin not allowed
    if (
      senderRole.toLowerCase() === "admin" &&
      receiverRole.toLowerCase() === "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Admins cannot message each other",
      });
    }

    const message = await Message.create({
      sender: req.user._id,
      receiver: to,
      text,
    });

    // ✅ Populate sender & receiver with fullName
    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "fullName role email")
      .populate("receiver", "fullName role email");

    res.status(201).json({
      success: true,
      data: populatedMessage,
    });
  } catch (error) {
    console.error("SendMessage Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* ================= GET CHAT MESSAGES ================= */
export const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;

    const otherUser = await User.findById(userId);
    if (!otherUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id },
      ],
    })
      .populate("sender", "fullName role email")
      .populate("receiver", "fullName role email")
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error("GetMessages Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* ================= USERS FOR SIDEBAR ================= */
export const getUsersForMessaging = async (req, res) => {
  try {
    const senderRole = Array.isArray(req.user.role)
      ? req.user.role[0]
      : req.user.role;

    // ✅ Fetch all users except current user
    let users = await User.find({
      _id: { $ne: req.user._id },
    })
      .select("fullName role email")
      .lean();

    // 🎯 student → only admins
    if (senderRole.toLowerCase() === "student") {
      users = users.filter((u) => {
        const role = Array.isArray(u.role) ? u.role[0] : u.role;
        return role.toLowerCase() === "admin";
      });
    }

    // 🎯 admin → only students
    if (senderRole.toLowerCase() === "admin") {
      users = users.filter((u) => {
        const role = Array.isArray(u.role) ? u.role[0] : u.role;
        return role.toLowerCase() === "student";
      });
    }

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("GetUsersForMessaging Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
