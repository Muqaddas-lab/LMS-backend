import Attempt from "../models/Attempt.js";
import Question from "../models/Question.js";
import Exam from "../models/Exam.js";

// ------------------ SUBMIT ATTEMPT ------------------
export const submitAttempt = async (req, res) => {
  console.log("\n" + "=".repeat(60));
  console.log("📝 SUBMIT ATTEMPT CALLED");
  console.log("=".repeat(60));
  
  try {
    console.log("📦 Raw Request Body:", JSON.stringify(req.body, null, 2));
    
    const { studentId, examId, answers } = req.body;

    // Log each field separately
    console.log("\n🔍 Individual Fields:");
    console.log("  studentId:", studentId, "| Type:", typeof studentId, "| Valid:", !!studentId);
    console.log("  examId:", examId, "| Type:", typeof examId, "| Valid:", !!examId);
    console.log("  answers:", answers, "| Type:", typeof answers, "| IsArray:", Array.isArray(answers), "| Length:", answers?.length);

    // Validate studentId
    if (!studentId || studentId === 'null' || studentId === 'undefined') {
      console.log("❌ studentId validation FAILED");
      return res.status(400).json({ 
        message: "studentId is required and must be valid",
        debug: { studentId, type: typeof studentId }
      });
    }

    // Validate examId
    if (!examId || examId === 'null' || examId === 'undefined') {
      console.log("❌ examId validation FAILED");
      return res.status(400).json({ 
        message: "examId is required and must be valid",
        debug: { examId, type: typeof examId }
      });
    }

    // Validate answers exists
    if (!answers) {
      console.log("❌ answers validation FAILED - answers is null/undefined");
      return res.status(400).json({ 
        message: "answers field is required",
        debug: { answers, type: typeof answers }
      });
    }

    // Validate answers is array
    if (!Array.isArray(answers)) {
      console.log("❌ answers validation FAILED - not an array");
      return res.status(400).json({ 
        message: "answers must be an array",
        debug: { type: typeof answers, isArray: false }
      });
    }

    // Validate answers not empty
    if (answers.length === 0) {
      console.log("❌ answers validation FAILED - empty array");
      return res.status(400).json({ 
        message: "answers array cannot be empty",
        debug: { length: 0 }
      });
    }

    console.log("✅ All validations passed!");
    console.log("-".repeat(60));

    // Verify exam exists
    console.log("\n🔍 Checking if exam exists...");
    const exam = await Exam.findById(examId);
    if (!exam) {
      console.log("❌ Exam not found for ID:", examId);
      return res.status(404).json({ message: "Exam not found", examId });
    }
    console.log("✅ Exam found:", exam.title);

    // Get question IDs from answers
    const questionIds = answers
      .map(a => a.questionId)
      .filter(id => id && id !== 'null' && id !== 'undefined');
    
    console.log("\n🔍 Fetching questions...");
    console.log("Question IDs:", questionIds);
    
    const questions = await Question.find({ _id: { $in: questionIds } });
    console.log(`✅ Found ${questions.length} questions`);

    if (questions.length === 0) {
      console.log("⚠️ Warning: No questions found for the provided IDs");
      console.log("Provided question IDs:", questionIds);
      return res.status(404).json({ 
        message: "No questions found for the provided question IDs",
        questionIds 
      });
    }

    // Calculate score
    let score = 0;
    console.log("\n📊 EVALUATING ANSWERS:");
    console.log("-".repeat(60));

    const detailedAnswers = answers.map((answer, idx) => {
      const question = questions.find(q => q._id.toString() === answer.questionId);
      
      console.log(`\n${idx + 1}. Question ID: ${answer.questionId}`);
      console.log(`   Selected: "${answer.selectedOption}"`);
      
      if (!question) {
        console.log(`   ⚠️ Question not found`);
        return {
          questionId: answer.questionId,
          selectedOption: answer.selectedOption || "",
          correctAnswer: null,
          marks: 0
        };
      }

      const marks = question.marks || 1;
      const correctAnswer = question.correctAnswer;
      const isCorrect = answer.selectedOption && answer.selectedOption === correctAnswer;

      console.log(`   Correct Answer: "${correctAnswer}"`);
      console.log(`   Worth: ${marks} mark(s)`);
      console.log(`   Result: ${isCorrect ? '✅ CORRECT' : '❌ WRONG'}`);

      if (isCorrect) {
        score += marks;
      }

      return {
        questionId: answer.questionId,
        selectedOption: answer.selectedOption || "",
        correctAnswer,
        marks: isCorrect ? marks : 0
      };
    });

    console.log("\n" + "=".repeat(60));
    console.log(`📊 FINAL SCORE: ${score} / ${exam.totalMarks}`);
    console.log("=".repeat(60));

    // Save attempt to database
    console.log("\n💾 Saving attempt to database...");
    const attempt = await Attempt.create({
      userId: studentId,
      exam: examId,
      answers: detailedAnswers,
      score
    });

    console.log("✅ Attempt saved successfully!");
    console.log("   Attempt ID:", attempt._id);
    console.log("   Collection: attempts");

    // Populate exam details for response
    await attempt.populate('exam', 'title totalMarks duration');

    console.log("✅ Response prepared");
    console.log("=".repeat(60) + "\n");

    res.status(201).json({ 
      success: true,
      message: "Attempt submitted successfully", 
      data: {
        attempt,
        score,
        totalMarks: attempt.exam.totalMarks,
        attemptId: attempt._id
      }
    });
    
  } catch (error) {
    console.error("\n" + "❌".repeat(30));
    console.error("ERROR IN SUBMIT ATTEMPT");
    console.error("❌".repeat(30));
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("=".repeat(60) + "\n");
    
    res.status(500).json({ 
      success: false,
      message: "Server error while submitting attempt", 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// ------------------ GET ATTEMPTS BY USER ------------------
export const getAttemptsByUser = async (req, res) => {
  try {
    console.log('🔍 Fetching attempts for user:', req.params.userId);
    
    const attempts = await Attempt.find({ userId: req.params.userId })
      .populate("exam", "title totalMarks duration")
      .sort({ submittedAt: -1 });
    
    console.log(`✅ Found ${attempts.length} attempts`);
    res.json(attempts);
  } catch (error) {
    console.error("❌ Get Attempts By User Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};

// ------------------ GET ATTEMPTS BY EXAM ------------------
export const getAttemptsByExam = async (req, res) => {
  try {
    console.log('🔍 Fetching attempts for exam:', req.params.examId);
    
    const attempts = await Attempt.find({ exam: req.params.examId })
      .populate("userId", "name email")
      .sort({ submittedAt: -1 });
    
    console.log(`✅ Found ${attempts.length} attempts`);
    res.json(attempts);
  } catch (error) {
    console.error("❌ Get Attempts By Exam Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};