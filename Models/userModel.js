
const mongoose = require("mongoose")

const userSchema = mongoose.Schema({
    name:{type:String, required:true},
    email:{type:String, required:true},
    password:{type:String, required:true},
    mobile:{type:String, required:true},
    role:{
        type:String,
        enum:["member","admin"],
        default:"admin"
    },
    course: [{ type: mongoose.Schema.Types.ObjectId, ref: 'course' }],
    allmember: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
    score: [{ type: mongoose.Schema.Types.ObjectId, ref: 'score' }],
    
}, 
{versionKey: false}
)

const userModel = mongoose.model("user",userSchema)

module.exports = {userModel}