import twilio from "twilio";
import dotenv from "dotenv";
import redis from "../config/redis.js";
import nodemailer from "nodemailer"

dotenv.config({ path: "./.env.local" });

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

if (!accountSid || !authToken || !verifyServiceSid) {
  throw new Error("Twilio credentials missing in .env");
}

const client = twilio(accountSid, authToken);

const IS_DEV = process.env.NODE_ENV !== "production";

/**
 * Send OTP to a phone or email
 */
export const sendOtp = async (identifier: string) => {
  const type = identifier.includes("@") ? "email" : "phone";
  const redisKey = `otp:${type}:${identifier}`;

  // check cache
  const existing = await redis.get(redisKey);
  if (existing) {
    console.log(`[CACHE] Reusing OTP for ${identifier}: ${existing}`);
    return { otp: existing, fromCache: true };
  }

  let otp = "";

  if (IS_DEV) {
    otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`[DEV] Mock OTP for ${type} ${identifier}: ${otp}`);
  } else if (type === "phone") {
    // production phone via Twilio
    const verification = await client.verify.v2
      .services(verifyServiceSid)
      .verifications.create({ to: `+91${identifier}`, channel: "sms" });
    console.log("✅ OTP sent via Twilio:", verification.sid);
    otp = verification.sid;
  } else {
    // email production placeholder
    // later replace with Nodemailer logic
    console.log(`[PROD] Send OTP via email to ${identifier}`);
    otp = Math.floor(100000 + Math.random() * 900000).toString(); // temp

    const transporter=nodemailer.createTransport({
      service:"gmail",
      auth:{
        user:process.env.EMAIL_USER,
        pass:process.env.EMAIL_PASS
      }
    })

    const emailOptions={
      from:process.env.EMAIL_USER,
      to:identifier,
      subject:"Your OTP is",
      text:`Your OTP is ${otp}. It will expire in 2 minutes.`
    }
    try {
      await transporter.sendMail(emailOptions) 
    } catch (error) {
      console.log("Error in sending OTP",error)
    }
  }

  // cache OTP for 2 mins
  await redis.set(redisKey, otp, "EX", 120);
  return { otp, fromCache: false };
};

/**
 * Verify OTP for phone or email
 */
export const verifyOtp = async (identifier: string, code: string) => {
  const type = identifier.includes("@") ? "email" : "phone";
  const redisKey = `otp:${type}:${identifier}`;
  const storedOtp = await redis.get(redisKey);

  if (!storedOtp) return { valid: false, message: "OTP expired" };

  if (IS_DEV || type === "email") {
    // dev / email: compare against cached OTP
    if (storedOtp !== code)
      return { valid: false, message: "Invalid OTP (DEV check)" };
    await redis.del(redisKey);
    return { valid: true, message: "OTP verified (DEV mode)" };
  }

  // production phone: verify via Twilio
  try {
    const verificationCheck = await client.verify.v2
      .services(verifyServiceSid)
      .verificationChecks.create({ to: `+91${identifier}`, code });

    if (verificationCheck.status === "approved") {
      await redis.del(redisKey);
      return { valid: true, message: "OTP verified (PROD mode)" };
    }

    return { valid: false, message: "Invalid or expired OTP" };
  } catch (error) {
    console.error("Twilio verify failed:", error);
    return { valid: false, message: "Verification error" };
  }
};
