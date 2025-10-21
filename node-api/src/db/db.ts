import mongoose from "mongoose";

const connectMongo=async()=>{
    try {
        const connnection = await mongoose.connect(`${process.env.MONGODB_URI}`)
        console.log(`Connection established to the mongo database: ${connnection.connection.host}`)
    } catch (error) {
        console.log("Mongodb connection failed",error)
        process.exit(1)
    }
}
export default connectMongo