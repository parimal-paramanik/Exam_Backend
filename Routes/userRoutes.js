const express = require("express")
const userRouter = express.Router()

const {userSignup,userLogin,createMember,createCourse,createExam,createQuestion,assignCourse, getCoursesByAdmin ,Analytics} = require("../Controller/userController")
const { useroauth } = require("../Middleware/userOauth")

userRouter.post("/signup",userSignup)
userRouter.post("/login",userLogin)
userRouter.post("/createMember",useroauth,createMember)
userRouter.post("/createCourse",useroauth,createCourse)
userRouter.post("/createExam",useroauth,createExam)
userRouter.post("/createQuestion",useroauth,createQuestion)
userRouter.post("/assignCourse",useroauth,assignCourse)
userRouter.get("/getCoursesByAdmin",useroauth,getCoursesByAdmin)
userRouter.get("/Analytics",useroauth,Analytics)


module.exports = {userRouter}
