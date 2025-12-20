import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { connectToDatabase } from "./config/db.js";

// ====== Routes ======
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import lectureRoutes from "./routes/lectureRoutes.js";
import enrollmentRoutes from "./routes/enrollmentRoutes.js";

// ====== MOCK Exam Routes ======
import examRoutes from "./routes/examRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import attemptRoutes from "./routes/attemptRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";

import errorHandler from "./middleware/errorMiddleware.js";

dotenv.config();
const app = express();

// Fixing __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ====== Middleware ======
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files publicly
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ====== Connect MongoDB ======
connectToDatabase();

// ====== API Routes ======
app.use("/api/auth", authRoutes);         // Login / Register
app.use("/api/users", userRoutes);        // User Management
app.use("/api/courses", courseRoutes);    // Courses
app.use("/api/lectures", lectureRoutes);  // Lectures
app.use("/api/enrollment", enrollmentRoutes);

// ====== MOCK Exam Routes ======
app.use("/api/exams", examRoutes);        // Exams CRUD
app.use("/api/questions", questionRoutes);// Questions CRUD
app.use("/api/attempts", attemptRoutes);  // User Exam Attempts

// ====== Messaging Routes ======
app.use("/api/messages", messageRoutes);  // Admin & Student Messages

// ====== Test Route ======
app.get("/", (req, res) => {
  res.send("LMS Backend Server Running Successfully! 🚀");
});

// ====== Error Handler ======
app.use(errorHandler);

// ====== Start Server ======
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});
