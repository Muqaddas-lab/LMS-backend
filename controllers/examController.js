import Exam from "../models/Exam.js";

// ================= CREATE EXAM =================
export const createExam = async (req, res) => {
  try {
    const { title, description, duration, totalMarks } = req.body;

    // ✅ Validation
    if (!title || !description || !duration || !totalMarks) {
      return res.status(400).json({ message: "All fields are required: title, description, duration, totalMarks" });
    }

    // Ensure req.user exists (middleware should set it)
    const createdBy = req.user ? req.user._id : null;

    const exam = await Exam.create({ title, description, duration, totalMarks, createdBy });
    res.status(201).json({ message: "Exam created successfully", exam });
  } catch (error) {
    console.error(error); // 🔹 Console pe exact error dikhega
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ================= GET ALL EXAMS =================
export const getAllExams = async (req, res) => {
  try {
    const exams = await Exam.find().populate("questions");
    res.json({ exams });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ================= GET EXAM BY ID =================
export const getExamById = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id).populate("questions");
    if (!exam) return res.status(404).json({ message: "Exam not found" });
    res.json({ exam });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ================= UPDATE EXAM =================
export const updateExam = async (req, res) => {
  try {
    const { title, description, duration, totalMarks } = req.body;

    // Optional: validate fields before update
    if (!title && !description && !duration && !totalMarks) {
      return res.status(400).json({ message: "Provide at least one field to update" });
    }

    const exam = await Exam.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!exam) return res.status(404).json({ message: "Exam not found" });

    res.json({ message: "Exam updated successfully", exam });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ================= DELETE EXAM =================
export const deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findByIdAndDelete(req.params.id);
    if (!exam) return res.status(404).json({ message: "Exam not found" });

    res.json({ message: "Exam deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
