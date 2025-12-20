import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import {
  createLecture,
  getLecturesByCourse,
  getLecture,
  updateLecture,
  deleteLecture,
} from "../controllers/lectureController.js";

import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// ADMIN
router.post(
  "/create",
  protect,
  admin,
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "pdf", maxCount: 1 },
  ]),
  createLecture
);

router.put(
  "/update/:id",
  protect,
  admin,
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "pdf", maxCount: 1 },
  ]),
  updateLecture
);

router.delete("/delete/:id", protect, admin, deleteLecture);

// ADMIN + STUDENT
router.get("/course/:courseId", protect, getLecturesByCourse);
router.get("/:id", protect, getLecture);

export default router;
