import { useEffect, useState } from "react";
import { InputOTP, InputOTPSlot } from "../ui/input-otp";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import ChangePhoneNumber from "./ChangePhoneNumber";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Spinner } from "../ui/spinner";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
type OtpVerificationProps = {
  mode: "login" | "signup";
  referral?: string;
  initialIdentifier: string;
};
function OtpVerification({
  mode,
  referral,
  initialIdentifier,
}: OtpVerificationProps) {
  const [identifier, setIdentifier] = useState(initialIdentifier);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState(30);
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const { userInfo } = useAuth();

  // Timer
  useEffect(() => {
    if (time <= 0) return;
    const timer = setInterval(() => setTime((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [time]);

  const handleVerify = async () => {
    if (otp.length !== 6) return toast.error("Enter 6-digit OTP");
    setLoading(true);
    try {
      console.log(mode);
      const response = await axios.post(
        `${import.meta.env.VITE_NODE_URI}api/v1/borrower/verify-otp-${
          mode === "signup" ? "signup" : "login"
        }`,
        mode === "signup"
          ? { phone: identifier, otp, referral }
          : { identifier, otp },
        { withCredentials: true }
      );
      console.log(response.data);
      const apiUser = response.data.user;
      const normalizedUser = {
        _id: apiUser._id,
        fullName: apiUser.profile?.fullName ||apiUser.fullName|| "",
        signupStage: apiUser.signupStage,
        kyc_status: apiUser.kyc?.kyc_status || "pending",
        rejectionReason: apiUser.kyc?.rejectionReason || "",
        role: apiUser.role,
      };
      userInfo(normalizedUser);
      navigate("/", { replace: true });
    } catch (err) {
      console.error(err);
      toast.error("OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async (newNumber?: string) => {
    const phoneToSend = newNumber; // if user changed number, use that
    setLoading(true);
    console.log(referral);
    try {
      console.log(referral);
      await axios.post(
        `${import.meta.env.VITE_NODE_URI}api/v1/borrower/signup`,
        { phone: phoneToSend, referral },
        { withCredentials: true }
      );
      toast.success("OTP sent successfully");
      setTime(30);
    } catch (err) {
      toast.error("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center justify-center space-y-6 w-full max-w-md">
        {/* Header */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-foreground">VERIFY OTP</h1>
          <h2 className="text-sm text-muted-foreground">
            We have sent an OTP to{" "}
            <span className="font-semibold text-foreground">{identifier}</span>
          </h2>
        </div>

        {/* OTP Input */}
        <InputOTP
          maxLength={6}
          className="flex gap-2"
          value={otp}
          onChange={(value) => setOtp(value)}
        >
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <InputOTPSlot
              key={i}
              index={i}
              className="w-13 h-15 border border-black rounded-lg text-center text-lg focus:border-ring focus:ring-2 focus:ring-ring"
            />
          ))}
        </InputOTP>

        {/* Timer & Change Identifier */}
        <div className="text-center text-sm text-muted-foreground space-y-1">
          <p>
            Expect OTP in{" "}
            <span className="font-semibold text-foreground">{time}s</span>
          </p>
          {mode === "signup" && (
            <p>
              Issue with OTP?{" "}
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <span
                    className="font-semibold text-black cursor-pointer underline underline-offset-2"
                    onClick={() => setDialogOpen(true)}
                  >
                    Change Registered Number
                  </span>
                </DialogTrigger>
                <DialogContent className="w-xl h-96">
                  <ChangePhoneNumber
                    setPhone={(newIdentifier) => {
                      setIdentifier(newIdentifier);
                      handleResendOtp(newIdentifier);
                    }}
                    closeDialog={() => setDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            </p>
          )}
        </div>

        {/* Continue Button */}
        <Button
          type="submit"
          className="w-full h-14 text-lg rounded-full"
          disabled={loading}
          onClick={handleVerify}
        >
          {loading && <Spinner />}
          Continue
        </Button>
      </div>
    </div>
  );
}

export default OtpVerification;
