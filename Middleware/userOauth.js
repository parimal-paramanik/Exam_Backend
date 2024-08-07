require("dotenv").config()
const jwt= require("jsonwebtoken")

const useroauth = async(req,res,next)=>{
try {
    const accessToken = req.headers.authorization
    if(!accessToken){
        return res.status(400).json({
             message: "Authentication Failed!",
             error:"No token provided, please login!"
        })
    }
    jwt.verify(accessToken,
        process.env.ACCESSTOKEN_SECRET_KEY,
        (err,payload)=>{
         if(err){
            return res.status(400).json({
                message:"authentication failed", error:err.message
            })
         }
         else if(payload){
                req.user = {userId:payload.user._id,
               role:payload.user.role}
         }
         next()
    })
} catch (error) {
    console.log("eror",error.message)
    res.send("eror",error.message)
}
}

module.exports = {useroauth}