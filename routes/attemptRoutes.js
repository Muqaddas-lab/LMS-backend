import express from "express";
import { submitAttempt, getAttemptsByUser, getAttemptsByExam } from "../controllers/attemptController.js";

const router = express.Router();

router.post("/", submitAttempt);
router.get("/user/:userId", getAttemptsByUser);
router.get("/exam/:examId", getAttemptsByExam);

export default router;
