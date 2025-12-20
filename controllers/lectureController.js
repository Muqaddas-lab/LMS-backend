import Lecture from "../models/Lectures.js";
import Course from "../models/Course.js";

/* =========================
   CREATE LECTURE
========================= */
export const createLecture = async (req, res) => {
  try {
    const {
      title,
      description,
      course,
      lectureNumber,
      type,
      videoUrl,
      duration,
      isFreePreview,
    } = req.body;

    const findCourse = await Course.findById(course);
    if (!findCourse) {
      return res.status(404).json({ message: "Course not found" });
    }

    const lecture = await Lecture.create({
      title,
      description,
      course,
      lectureNumber,
      type,
      videoUrl,
      duration,
      isFreePreview,
      videoPath: req.files?.video ? req.files.video[0].path : "",
      pdfPath: req.files?.pdf ? req.files.pdf[0].path : "",
    });

    findCourse.totalLectures += 1;
    await findCourse.save();

    res.status(201).json({
      message: "Lecture created successfully",
      lecture,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

/* =========================
   GET LECTURES BY COURSE
========================= */
export const getLecturesByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const lectures = await Lecture.find({
      course: courseId,
      isDeleted: false,
      status: "Active",
    }).sort({ lectureNumber: 1 });

    res.json(lectures);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

/* =========================
   GET SINGLE LECTURE
========================= */
export const getLecture = async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id).populate(
      "course",
      "title"
    );

    if (!lecture || lecture.isDeleted) {
      return res.status(404).json({ message: "Lecture not found" });
    }

    res.json(lecture);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

/* =========================
   UPDATE LECTURE
========================= */
export const updateLecture = async (req, res) => {
  try {
    const updatedData = { ...req.body };

    if (req.files?.video) {
      updatedData.videoPath = req.files.video[0].path;
    }

    if (req.files?.pdf) {
      updatedData.pdfPath = req.files.pdf[0].path;
    }

    const lecture = await Lecture.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    );

    if (!lecture) {
      return res.status(404).json({ message: "Lecture not found" });
    }

    res.json({
      message: "Lecture updated successfully",
      lecture,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

/* =========================
   DELETE LECTURE (SOFT)
========================= */
export const deleteLecture = async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id);

    if (!lecture) {
      return res.status(404).json({ message: "Lecture not found" });
    }

    lecture.isDeleted = true;
    await lecture.save();

    res.json({ message: "Lecture deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
