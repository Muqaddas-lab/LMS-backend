import express from "express";
import { sendMessage, getMessages, getUsersForMessaging } from "../controllers/messageController.js";
import { protect } from "../middleware/authMiddleware.js"; // ensure req.user exists

const router = express.Router();

// ================= SEND MESSAGE =================
router.post("/", protect, sendMessage);

// ================= GET MESSAGES WITH USER =================
router.get("/:userId", protect, getMessages);

// ================= GET ALL USERS FOR MESSAGING =================
router.get("/", protect, getUsersForMessaging);

export default router;
