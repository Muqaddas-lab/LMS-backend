import Enrollment from "../models/Enrollment.js";

// Enroll in Course
export const enrollCourse = async (req, res) => {
    try {
        const { studentId, courseId } = req.body;
        const existing = await Enrollment.findOne({ student: studentId, course: courseId });
        if(existing) return res.status(400).json({ message: "Already enrolled" });

        const enrollment = new Enrollment({ student: studentId, course: courseId });
        await enrollment.save();
        res.status(201).json(enrollment);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get Enrolled Courses
export const getEnrolledCourses = async (req, res) => {
    try {
        const enrollments = await Enrollment.find({ student: req.params.studentId }).populate("course");
        res.status(200).json(enrollments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Remove Enrollment
export const removeEnrollment = async (req, res) => {
    try {
        await Enrollment.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Enrollment removed" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
