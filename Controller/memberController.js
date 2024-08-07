
const { userModel } = require("../Models/userModel");
const {scoreModel} = require("../Models/scoreModel")


const getCourse = async (req, res) => {
    const { user } = req;
    try {
        // Find the user by ID from the authenticated user object
        const member = await userModel.findById(user.userId).populate({
            path: 'course',
            populate: {
                path: 'exams',
                populate: {
                    path: 'questions'
                }
            }
        });
    
        if (!member) {
            return res.status(404).json({
                message: "User not found",
                error: "Invalid user ID"
            });
        }

        // Return the populated course data
        return res.status(200).json({
            message: "Course details retrieved successfully",
            data: member.course
        });

    } catch (error) {
        console.error("[GET COURSE ERROR]", error);
        return res.status(500).json({
            message: "Internal Server Error!",
            error: error.message
        });
    }
};


 const submitScore = async (req, res) => {
  const {examname, score, result } = req.body;
  const { user } = req;

  try {
    // Find the member
    const isMemberPresent = await userModel.findById(user.userId);
    if (!isMemberPresent) {
      return res.status(404).json({
        message: "Member not found",
        error: "Invalid member ID",
      });
    }

    // Check if a score for the same examname already exists for this member
    const existingScore = await scoreModel.findOne({
      member: user.userId,
      examname: examname,
    });

    if (existingScore) {
      return res.status(409).json({
        message: "Score for this exam already exists",
        error: "Duplicate score entry",
      });
    }

    // Create the score document
    const newScore = new scoreModel({
      member: user.userId,
      examname,
      score,
      result,
    });

    // Save the score document
    await newScore.save();

    // Add the score reference to the member's score array
    isMemberPresent.score.push(newScore._id);
    await isMemberPresent.save();

    res.status(201).json({
      message: "Score submitted successfully!",
      data: newScore,
    });
  } catch (error) {
    console.error("[SUBMIT SCORE ERROR]", error);
    res.status(500).json({
      message: "Internal Server Error!",
      error: error.message,
    });
  }
};

//   get your score members
const getYourscore = async (req, res) => {
    const { user } = req; // Assuming `user` is attached to the request object (e.g., from authentication middleware)
  
    try {
      // Find all scores for the member
      const scores = await scoreModel.find({ member: user.userId });
  
      // If no scores are found, return an appropriate message
      if (scores.length === 0) {
        return res.status(404).json({
          message: "No scores found for this member",
        });
      }
  
      // Return the scores
      res.status(200).json({

        message: "Scores retrieved successfully",
        data: scores,
      });
    } catch (error) {
      console.error("[GET SCORE ERROR]", error);
      res.status(500).json({
        message: "Internal Server Error",
        error: error.message,
      });
    }
  };
  
  

module.exports = {getCourse,submitScore,getYourscore}

