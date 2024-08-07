const mongoose = require("mongoose")

const examSchema = mongoose.Schema({
    examname:{type:String, required:true},
    totalMarks:{type:Number, required:true},
    passMarks:{type:Number, required:true},
    duration:{type:Number, required:true}, 
    // attempted:{type:Boolean, default:false}, 
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'question' }],
}, 
{versionKey: false}
)

const examModel = mongoose.model("exam",examSchema)

module.exports = {examModel}