import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import connectMongo from "./db/db.js"



import userRouter from "./routes/user.routes.js"
dotenv.config({path:"./.env.local"})
const app=express()

// app.use statements
app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true,
}))




// Variables declaration
const PORT=process.env.PORT || 5000

app.get("/",(req,res)=>{
    res.send("Server is up and running like tom cruise")
})
// routes
app.use("/api/v1/borrower/",userRouter)

const startServer = async () => {
  await connectMongo(); // Connect to MongoDB first
  app.listen(PORT, () => {
    console.log(` Node server running on http://localhost:${PORT}`);
  });
};

startServer();
