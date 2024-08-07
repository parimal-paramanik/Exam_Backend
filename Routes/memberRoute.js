const express = require("express")
const memberRouter = express.Router()

const { useroauth } = require("../Middleware/userOauth")
const { getCourse,submitScore,getYourscore} = require("../Controller/memberController")


memberRouter.get("/getCourse",useroauth,getCourse)
memberRouter.post("/submitScore",useroauth,submitScore)
memberRouter.get("/getYourscore",useroauth,getYourscore)


module.exports = {memberRouter}

