import Attempt from "../models/Attempt.js";

export const submitAttempt = async (req, res) => {
  try {
    const { userId, examId, answers } = req.body;
    // calculate score
    let score = 0;
    for (const a of answers) {
      if (a.selectedOption === a.correctAnswer) score += a.marks || 1;
    }
    const attempt = await Attempt.create({ userId, examId, answers, score });
    res.status(201).json(attempt);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const getAttemptsByUser = async (req, res) => {
  try {
    const attempts = await Attempt.find({ userId: req.params.userId }).populate("examId");
    res.json(attempts);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const getAttemptsByExam = async (req, res) => {
  try {
    const attempts = await Attempt.find({ examId: req.params.examId }).populate("userId");
    res.json(attempts);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
