import Progress from "../models/Progress.js";

// Track Lecture Completion
export const trackLecture = async (req, res) => {
    try {
        const { studentId, courseId, lectureId } = req.body;

        let progress = await Progress.findOne({ student: studentId, course: courseId });
        if(!progress){
            progress = new Progress({ student: studentId, course: courseId, completedLectures: [lectureId] });
        } else {
            if(!progress.completedLectures.includes(lectureId)){
                progress.completedLectures.push(lectureId);
            }
        }

        await progress.save();
        res.status(200).json(progress);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get Progress / Analytics
export const getProgress = async (req, res) => {
    try {
        const progress = await Progress.findOne({ student: req.params.studentId, course: req.params.courseId }).populate("completedLectures");
        const totalLectures = progress ? progress.completedLectures.length : 0;
        res.status(200).json({ progress, totalLectures });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
