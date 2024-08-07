const express = require("express")
const cors = require("cors")
const app = express()
app.use(express.json())

const Connection = require("./config/db")
const { userRouter } = require("./Routes/userRoutes")
const { memberRouter } = require("./Routes/memberRoute")
require("dotenv").config()
const port = process.env.port

app.use(cors())

app.get("/",(req,res)=>{
    res.send("everything is working fine")
})
app.use("/",userRouter)
app.use("/member",memberRouter)


app.listen(port,async(req,res)=>{
    try {
        await Connection
        console.log("server is connected to database")

    } catch (error) {
        console.log("error connecting to database")
    }
    console.log(`server is running at port ${port}`)
})

//  user data
// {
//     "email":"m1@gmail.com",
//     "password":"Member1@123"
// }

// admin
// {
//     "email":"radhe@gmail.com",
//     "password":"Radhe@123"
// }