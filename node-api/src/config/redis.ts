import {Redis} from "ioredis"
import dotenv from "dotenv"
dotenv.config({path:"./.env.local"})

const redis =new Redis(`${process.env.REDIS_URI}`);

redis.on("connect",()=>console.log("connected to Redis"));
redis.on("error",(err:Error)=>console.log("Redis error",err))

export default redis
