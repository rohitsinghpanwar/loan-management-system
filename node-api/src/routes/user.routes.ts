import { Router } from "express";
import {signup,verifyOtpSignup,profileSetup,uploadKycDocuments,login,verifyOtpLogin, getMe, logOut, changeKycStatus, kycRequests, borrowerProfile } from "../controllers/user.controller.js";
import { verifyAccessToken } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
const router=Router()

router.post("/signup",signup)
router.post("/verify-otp-signup",verifyOtpSignup)
router.post("/profile",verifyAccessToken,profileSetup)
router.post("/kyc/upload",verifyAccessToken,
upload.array("documents"),uploadKycDocuments)
router.post("/login",login)
router.post("/verify-otp-login",verifyOtpLogin)
router.get("/me",verifyAccessToken,getMe)
router.post("/logout",verifyAccessToken,logOut)
router.get("/profile",verifyAccessToken,borrowerProfile)

router.patch("/kyc-status/:userId",verifyAccessToken,changeKycStatus)
router.get("/kyc-requests",verifyAccessToken,kycRequests)

export default router