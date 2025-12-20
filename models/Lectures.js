import mongoose from "mongoose";

const lectureSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    lectureNumber: {
      type: Number,
      default: 1,
    },

    type: {
      type: String,
      enum: ["video", "pdf", "document", "quiz"],
      default: "video",
    },

    videoUrl: {
      type: String,
      default: "",
    },

    videoPath: {
      type: String,
      default: "",
    },

    pdfPath: {
      type: String,
      default: "",
    },

    duration: {
      type: Number,
      default: 0,
    },

    isFreePreview: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Lecture", lectureSchema);
