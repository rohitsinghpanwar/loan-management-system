import { User } from "../models/user.model.js";
import { Request, Response } from "express";
import { sendOtp, verifyOtp } from "../utils/twilioOtp.js";
import { CookieOptions } from "express";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const AToptions: CookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: false,
  maxAge: 60 * 60 * 1000,
};

const signup = async (req: Request, res: Response) => {
  const { phone } = req.body;
  if (!phone)
    return res.status(400).json({ message: "Phone number is required" });
  const existedUser = await User.findOne({ phone });
  if (existedUser) {
    return res
      .status(400)
      .json({ message: "User exists already try to login" });
  }
  await sendOtp(phone);
  res.json({ message: "OTP sent successfully" });
};

const verifyOtpSignup = async (req: Request, res: Response) => {
  const { phone, otp, referral } = req.body;
  console.log(req.body);
  if (!phone || !otp)
    return res.status(400).json({ message: "OTP and Phone is required" });
  const valid = await verifyOtp(phone, otp);
  if (!valid) return res.status(400).json({ message: "Invalid OTP" });
  const user = await User.create({
    phone: phone,
    referralCode: referral,
  });
  const createdUser = await User.findById(user.id)
    .lean()
    .select("_id signupStage role");
  const accessToken = user.generateAccessToken();
  return res
    .status(201)
    .cookie("AmplioAT", accessToken, AToptions)
    .json({ message: "Signup successful", user: createdUser });
};

const profileSetup = async (req: Request, res: Response) => {
  const { fullName, email, dob, address, city, state } = req.body.formdata;
  if (!fullName || !email || !dob || !address || !city || !state) {
    return res.status(400).json({ message: "All fields are required" });
  }
  const userId = (req as any).user?._id;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  if (user.signupStage === "kyc_pending") {
    return res.status(400).json({ message: "Profile already set" });
  }
  user.profile.fullName = fullName;
  user.profile.email = email;
  user.profile.dob = new Date(dob);
  user.profile.address = address;
  user.profile.city = city;
  user.profile.state = state;
  user.signupStage = "kyc_pending";
  await user.save();
  const accessToken = user.generateAccessToken();
  const updatedUser = await User.findById(userId)
    .lean()
    .select("_id signupStage profile.fullName kyc.kyc_status role kyc.rejectionReason ");
  return res
    .status(200)
    .cookie("AmplioAT", accessToken, AToptions)
    .json({ message: "Profile set successfully", user: updatedUser });
};

interface MulterFile {
  buffer: Buffer;
  originalname: string;
}

const uploadKycDocuments = async (req: Request, res: Response) => {
  try {
    const files = req.files as MulterFile[];
    const { types } = req.body; // expects an array like ["Aadhar Card", "PAN Card"]

    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const docTypes = Array.isArray(types) ? types : [types];
    const uploadedDocs: { docType: string; url: string }[] = [];

    for (let i = 0; i < files.length; i++) {
      const uploaded = await uploadOnCloudinary(files[i].buffer);
      if (uploaded) {
        uploadedDocs.push({
          docType: docTypes[i] || "Unknown",
          url: uploaded.secure_url,
        });
      }
      if (!uploaded)
        console.log(
          "Cloudinary upload failed for file:",
          files[i].originalname
        );
    }

    // Update user's KYC object
    const userId = (req as any).user?._id; // assuming req.user exists from auth middleware
    console.log(userId);
    const user = await User.findById(userId).select(
      "_id profile.fullName kyc.kyc_status signup_stage role"
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    user.kyc = {
      documents: uploadedDocs,
      kyc_status: "under_review", 
      rejectionReason:""
    };

    await user.save();

    res.status(200).json({
      message: "KYC uploaded successfully",
      kyc: user.kyc,
      user: user,
    });
  } catch (error: any) {
    console.error("KYC Upload Error:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const login = async (req: Request, res: Response) => {
  const { identifier } = req.body; // email or phone

  if (!identifier)
    return res.status(400).json({ message: "Email or phone is required" });

  const isEmail = identifier.includes("@");

  // Find user by phone or profile.email
  const user = isEmail
    ? await User.findOne({
        $or: [{ "profile.email": identifier }, { email: identifier }],
      })
    : await User.findOne({ phone: identifier });
  if (!user)
    return res.status(404).json({
      message: isEmail
        ? "Email not registered, please signup"
        : "Phone not registered, please signup",
    });
  const { otp, fromCache } = await sendOtp(identifier);

  return res.status(200).json({
    message: `OTP sent to ${identifier}`,
    otp: process.env.NODE_ENV !== "production" ? otp : undefined, // dev only
    fromCache,
  });
};

const verifyOtpLogin = async (req: Request, res: Response) => {
  const { identifier, otp } = req.body;

  if (!identifier || !otp)
    return res.status(400).json({ message: "OTP and identifier required" });

  const isEmail = identifier.includes("@");

  const user = isEmail
    ? await User.findOne({
        $or: [{ "profile.email": identifier }, { email: identifier }],
      })
    : await User.findOne({ phone: identifier });

  if (!user)
    return res.status(404).json({ message: "User not found, please signup" });

  const { valid, message } = await verifyOtp(identifier, otp);
  if (!valid)
    return res.status(400).json({ message: "Not a valid identifier" });

  // Generate access token
  const accessToken = user.generateAccessToken();

  const responseUser = await User.findById(user._id)
    .select("_id profile.fullName signupStage kyc.kyc_status role kyc.rejectionReason")
    .lean();

  return res
    .status(200)
    .cookie("AmplioAT", accessToken, AToptions)
    .json({ message: "Login successful", user: responseUser });
};

const getMe = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?._id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(userId).lean();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const fullName =
      (user as any).profile?.fullName || (user as any).fullName || "";

    return res.status(200).json({
      _id: user._id,
      fullName,
      signupStage: (user as any).signupStage || "",
      kyc_status: (user as any).kyc?.kyc_status || "pending",
      rejectionReason: (user as any).kyc?.rejectionReason || "",
      role: (user as any).role,
    });
  } catch (error) {
    console.error("getMe error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


const logOut = async (_: Request, res: Response) => {
  try {
    res.clearCookie("AmplioAT", AToptions);
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const changeKycStatus = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const role = (req as any).user?.role;
    const { signupStage, kyc_status, rejectionReason } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found to update kyc status" });
    }
    if (!kyc_status) {
      return res
        .status(400)
        .json({ message: "KYC status is needed to update in DB" });
    }
    user.signupStage = signupStage;
    user.kyc.kyc_status = kyc_status;
    if (kyc_status === "rejected") {
      if (!rejectionReason || rejectionReason.trim() === "") {
        return res
          .status(400)
          .json({ message: "Rejection reason is required" });
      }
      user.kyc.rejectionReason = rejectionReason;
    }

    await user.save();
    return res
      .status(200)
      .json({ message: "KYC status updated successfully", user });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const kycRequests = async (req: Request, res: Response) => {
  try {
    // Fetch all users whose KYC is under review and signupStage is kyc_pending
   const users = await User.find({
  "kyc.kyc_status": { $in: ["under_review", "approved", "rejected"] }
});

    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No KYC requests found" });
    }

    res.status(200).json({
      message: "KYC requests fetched successfully",
      users,
    });
  } catch (error) {
    console.error("Error fetching KYC requests:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

const borrowerProfile=async(req:Request,res:Response)=>{
  try {
    const userId=(req as any).user?._id
    if(!userId){
      return res.status(400).json({message:"User id not found"})
    }
    const user=await User.findById(userId).select("profile phone kyc.kyc_status").lean()
    if(!user){
      return res.status(404).json({message:"User not found"})
    }
    return res.status(200).json({message:"User Profile found",user})

  } catch (error) {
    console.error("Error in finding in profile:", error);
    res.status(500).json({ message: "Server error", error });
  }
}

export {
  signup,
  verifyOtpSignup,
  profileSetup,
  login,
  verifyOtpLogin,
  uploadKycDocuments,
  getMe,
  logOut,
  changeKycStatus,
  kycRequests,
  borrowerProfile
};
