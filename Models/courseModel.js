const mongoose = require("mongoose")

const courseSchema = mongoose.Schema({
    courseName:{type:String, required:true},
    description:{type:String, required:true},
    exams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'exam' }],
}, 
{versionKey: false}
)

const courseModel = mongoose.model("course",courseSchema)

module.exports = {courseModel}