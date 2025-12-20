import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }], // array of 4 options
  correctAnswer: { type: String, required: true },
  marks: { type: Number, default: 1 },
}, { timestamps: true });

export default mongoose.model("Question", questionSchema);
