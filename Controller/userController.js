const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { userModel } = require("../Models/userModel");
const { courseModel } = require("../Models/courseModel");
const { examModel } = require("../Models/examModel");
const {questionModel} = require("../Models/answerModel");
// const { memberModel } = require("../Models/memberModel");

require("dotenv").config()

//  signup a admin 
const userSignup = async (req, res) => {
    const { name, email, password, mobile } = req.body;
    // Checking if proper information is being sent from client
    if (!name || !email || !password || !mobile) {
        return res.status(401).json({
            message: "Failed to register",
            error: "Insufficient Information!",
        });
    }
    //Checking if user is already present in database
    const isUser = await userModel.findOne({ email });
    if (isUser) {
        return res.status(401).json({

            "message": "Failed to register",
            "error": "User already exists with this email!"


        });
    }
    try {
        // hashing the password with bcrypt
        const hashedPassword = await bcrypt.hash(password, 8);

        // Creating a new user in database
        const user = new userModel({
            email,
            name,
            mobile,
            password: hashedPassword,
        });
        await user.save();

        // Sending the registered user details in response upon successful registration
        return res.status(200).json({
            message: "Registartion successful!",
            data: user,
        });
    } catch (error) {
        console.log("[REGISTER ERROR]", error);
        return res
            .status(500)
            .json({ message: "Internal Error!", error: error.message });
    }
};

// common route to login both admin and member
const userLogin = async (req, res) => {
    //Retreiving user email and password from request body
    const { email, password } = req.body;
    // console.log(req.body)
    if (!email || !password) {
        return res.status(401).json({
            message: "Login Failed!",
            error: "Insufficient Information!",
        });
    }
    try {
        // Checking for user in database
        const isUserPresent = await userModel.findOne({ email });

        // User not present in the database.
        if (!isUserPresent) {
            return res.status(404).json({
                message: "Login Failed! No user found. Please register!",
                error: "No user found. Please register!!"
            });
        }
        // Password verification
        const isPasswordCorrect = bcrypt.compareSync(
            password,
            isUserPresent.password
        );
        // If password is not correct
        if (!isPasswordCorrect) {
            return res.status(401).send({
                message: "Login Failed!",
                error: "Wrong Credentials!",
            });
        }
        const accessToken = jwt.sign({ user: isUserPresent }, process.env.ACCESSTOKEN_SECRET_KEY, { expiresIn: "30d" })

        return res.status(200).send({
            data: { accessToken, isUserPresent },
            message: "Login Success!",
            error: [],
        });
    } catch (error) {
        console.log("[LOGIN ERROR]", error);
        return res.status(500).json({
            message: "Internal Server error!",
            error: error.message,
        });
    }
};



// route to create a member in the database by admin only()
const createMember = async (req, res) => {
    // Retrieve the token from the request headers
    // const accessToken = req.headers.authorization;
    const { user } = req;
    // console.log("user is",user)

    const { name, email, password, mobile } = req.body;

    if (!email || !password || !name || !mobile) {
        return res.status(401).json({
            message: "Member Creation  Failed!",
            error: "Insufficient Information!",
        });
    }
    //Checking if member is already present in database
    const isMemberPresent = await userModel.findOne({ email });
    if (isMemberPresent) {
        return res.status(401).json({

            "message": "Failed to create member",
            "error": "User already exists with this email!"
        });
    }

    try {
        // Check if the user making the request is a  admin
        if (user.role !== "admin") {
            return res.status(403).json({
                message: "Access denied! Only admin can perform this action.",
                error: "Access denied.",
            });
        }
        const admin = await userModel.findById(user.userId)

        const hashedPassword = await bcrypt.hash(password, 8);

        const newMember = new userModel({
            name,
            email,
            mobile,
            password: hashedPassword,
            role: "member"
        });

        await newMember.save();
        admin.allmember.push(newMember._id)
        await admin.save()

        return res.status(200).json({
            message: "Member created successfully!",
            data: newMember,
        });
    } catch (error) {
        console.log("[CREATE newMember ERROR]", error);
        return res.status(500).json({
            message: "Internal Server error!",
            error: error.message,
        });
    }
};

// route to create a course in the database by admin only()
const createCourse = async (req, res) => {
    // Retrieve the token from the request headers
    // const accessToken = req.headers.authorization;
    const { user } = req;
    console.log("user is",user)

    const { courseName, description } = req.body;

    if (!courseName || !description) {
        return res.status(401).json({
            message: "course Creation  Failed!",
            error: "Insufficient Information!",
        });
    }
    //Checking if user is already present in database
    const isCoursePresent = await courseModel.findOne({ courseName });
    if (isCoursePresent) {
        return res.status(401).json({
            "message": "Failed to create course",
            "error": "course already exists with same name!"
        });
    }

    try {
        // Check if the user making the request is a  admin
        if (user.role !== "admin") {
            return res.status(403).json({
                message: "Access denied! Only admin can perform this action.",
                error: "Access denied.",
            });
        }
        const admin = await userModel.findById(user.userId)

        const newCourse = new courseModel({
            courseName,
            description
        });

        await newCourse.save();
        admin.course.push(newCourse._id)
        await admin.save()

        return res.status(200).json({
            message: "newCourse created successfully!",
            data: newCourse,
        });
    } catch (error) {
        console.log("[CREATE newCourse ERROR]", error);
        return res.status(500).json({
            message: "Internal Server error!",
            error: error.message,
        });
    }
};

//  get all courses of a admin
const getCoursesByAdmin = async (req, res) => {
    const { user } = req;
  
    try {
      // Check if the user making the request is an admin
      if (user.role !== "admin") {
        return res.status(403).json({
          message: "Access denied! Only admin can perform this action.",
          error: "Access denied.",
        });
      }
  
      // Find the admin user by ID
      const admin = await userModel.findById(user.userId)
      .populate('course')    // Populate the course field
      .populate('allmember');   // Populate the member field
  
      if (!admin) {
        return res.status(404).json({
          message: "Admin not found!",
          error: "User does not exist.",
        });
      }
  
      // Return the courses associated with the admin user
      return res.status(200).json({
        message: "Courses retrieved successfully!",
        data: {
            courses: admin.course,
            members: admin.allmember,
        },
      });
    } catch (error) {
      console.log("[GET COURSES BY ADMIN ERROR]", error);
      return res.status(500).json({
        message: "Internal Server error!",
        error: error.message,
      });
    
    }
  };
  
// route to create exams in the database by admin only()
const createExam = async (req, res) => {
    const { user } = req;
    const { courseId } = req.query;
    const { examname, totalMarks, passMarks, duration } = req.body;

    if (!examname || !totalMarks || !passMarks || !duration) {
        return res.status(400).json({
            message: "Exam creation failed!",
            error: "Insufficient information!",
        });
    }

    // Checking if exam is already present in the database
    const isExamPresent = await examModel.findOne({ examname });
    if (isExamPresent) {
        return res.status(409).json({
            message: "Failed to create exam",
            error: "Exam already exists with the same name!",
        });
    }

    try {
        // Check if the user making the request is an admin
        if (user.role !== "admin") {
            return res.status(403).json({
                message: "Access denied! Only admin can perform this action.",
                error: "Access denied.",
            });
        }

        const course = await courseModel.findById(courseId);
        if (!course) {
            return res.status(404).json({
                message: "Course not found",
            });
        }

        const newExam = new examModel({
            examname,
            totalMarks,
            passMarks,
            duration,
        });

        await newExam.save();
        course.exams.push(newExam._id);
        await course.save();

        return res.status(201).json({
            message: "Exam created successfully!",
            data: newExam,
        });
    } catch (error) {
        console.error("[CREATE EXAM ERROR]", error);
        return res.status(500).json({
            message: "Internal Server Error!",
            error: error.message,
        });
    }
};

// route to create questions in the database by admin only()
const createQuestion = async (req, res) => {
const { questionText, options } = req.body;
const { examId } = req.query;
const { user } = req;

if (!questionText || !options || options.length < 2) {
    return res.status(400).json({
        message: "Question creation failed!",
        error: "Insufficient information or too few options provided!",
    });
}

const hasCorrectOption = options.some(option => option.isCorrect);
if (!hasCorrectOption) {
    return res.status(400).json({
        message: "Question creation failed!",
        error: "At least one option must be marked as correct!",
    });
}

try {
    // Check if the user making the request is a  admin
    if (user.role !== "admin") {
        return res.status(403).json({
            message: "Access denied! Only admin can perform this action.",
            error: "Access denied.",
        });
    }
    const isexamPresent = await examModel.findById(examId);
        if (!isexamPresent) {
            return res.status(404).json({
                message: "Exam not found",
            });
        }
        

    const newQuestion = new questionModel({ questionText, options });
    await newQuestion.save();
    isexamPresent.questions.push(newQuestion._id)
    await isexamPresent.save()

    return res.status(201).json({
        message: "Question created successfully!",
        data: newQuestion,
    });
} catch (error) {
    console.error("[CREATE QUESTION ERROR]", error);
    return res.status(500).json({
        message: "Internal Server Error!",
        error: error.message,
    });
}
};

//  assign a course to a member
const assignCourse = async (req, res) => {
    const { user } = req;
    const { courseId, memberId } = req.body;  // Assuming these are passed in the request body

    try {
        // Check if the user making the request is an admin
        if (user.role !== "admin") {
            return res.status(403).json({
                message: "Access denied! Only admin can perform this action.",
                error: "Access denied.",
            });
        }
       //  find the admin
       const admin = await userModel.findById(user.userId)
        // Find the member user by ID
        const member = await userModel.findById(memberId);
        if (!member) {
            return res.status(404).json({
                message: "Member not found",
                error: "Invalid member ID",
            });
        }

        // Check if the course exists
        const course = await courseModel.findById(courseId);
        if (!course) {
            return res.status(404).json({
                message: "Course not found",
                error: "Invalid course ID",
            });
        }

        // Add the courseId to the member's courses array if it's not already there
        if (!member.course.includes(courseId)) {
            member.course.push(courseId);
            await member.save();
            
            // Add the member ID to the admin's allmember array if it's not already there
            if (!admin.allmember.includes(member._id)) {
                admin.allmember.push(member._id);
                await admin.save();
            }
            return res.status(200).json({
                message: "Course assigned to member successfully!",
                data: member,
            });
        } else {
            return res.status(409).json({
                message: "Course already assigned to member",
                error: "Duplicate course assignment",
            });
        }
    } catch (error) {
        console.error("[ASSIGN COURSE ERROR]", error);
        return res.status(500).json({
            message: "Internal Server Error!",
            error: error.message,
        });
    }
};

// get details of courses , members , and their scores.

const Analytics = async (req, res) => {
    const { user } = req;
    try {
      // Find all scores for the member
      const admin = await userModel.findById(user.userId).populate({
        path: 'allmember',
        populate: {
            path: 'score',
            model: 'score' 
        }
    });
      if (!admin) {
        return res.status(404).json({
          message: "No admin found for this member",
        });
      }
    // Map through each member and retrieve their scores
    const membersWithScores = admin.allmember.map(member => ({
        memberName: member.name,
        scores: member.score.map(score => ({
            examName: score.examname,
            score: score.score,
            result: score.result ? 'Pass' : 'Fail'
        }))
    }));
      // Return the scores
      return res.status(200).json({
        message: "Members and their scores retrieved successfully",
        data: membersWithScores
    });
    } catch (error) {
      console.error("[GET SCORE ERROR]", error);
      res.status(500).json({
        message: "Internal Server Error",
        error: error.message,
      });
    }

};

module.exports = { userSignup, userLogin, createMember, createCourse ,createExam ,createQuestion,assignCourse, getCoursesByAdmin,Analytics}
