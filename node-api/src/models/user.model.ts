import { Schema, model, Document } from "mongoose";
import jwt,{Secret} from "jsonwebtoken"

export interface IUser extends Document {
  phone: string;
  role: "admin" | "borrower";
  referralCode?: string;
  signupStage: "otp_pending" | "profile_pending" | "kyc_pending" | "completed";
  profile: {
    fullName: string;
    email: string;
    dob: Date;
    address: string;
    city: string;
    state: string;
  };
  kyc: {
    documents: { docType: string; url: string }[];
    kyc_status: "pending"| "under_review" | "approved" | "rejected";
    rejectionReason: string;
  };
  generateAccessToken:()=>string
}

const userSchema = new Schema<IUser>(
  {
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    role: {
      type: String,
      enum: ["borrower", "admin"],
      default: "borrower",
    },
    referralCode: { type: String },
    signupStage: {
      type: String,
      enum: ["profile_pending", "kyc_pending", "completed"],
      default: "profile_pending",
    },
    profile: {
      fullName: {type: String,default:""},
      email: { type: String ,default:""},
      dob: { type: Date},
      address: { type: String,default:""},
      city: { type: String,default:"" },
      state: { type: String,default:"" },
    },
    kyc: {
      documents: [{ docType: { type: String }, url: { type: String } }],
      kyc_status: {
        type: String,
        enum: ["pending","under_review","approved", "rejected"],
        default: "pending",
      },
      rejectionReason: {type: String,default:""},
    },
  },
  { timestamps: true }
);

userSchema.methods.generateAccessToken = function (): string {
  const secret: Secret | undefined = process.env.ACCESS_TOKEN_SECRET;

  if (!secret) {
    throw new Error("ACCESS_TOKEN_SECRET is not defined");
  }
  return jwt.sign(
    { _id: this._id,role:this.role},
    secret,
    {expiresIn:"1h" }
  );
};

export const User = model<IUser>("user", userSchema);
