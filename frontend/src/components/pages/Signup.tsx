import { Button } from "../ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Spinner } from "../ui/spinner";
import axios from "axios";
import OtpVerification from "./OtpVerification";
import { toast } from "sonner";
function Signup() {
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState(1);
  const [referral, setReferral] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_NODE_URI}api/v1/borrower/signup`,
        { phone, referral },
        { withCredentials: true }
      );
      setStep(2);
    } catch (error:any) {
      if(error.response?.status===400){
        toast.error("User Exists Already! Try Login")
      }else{
        toast.error("Failed to send OTP. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      {step === 1 && (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <form
            className="w-90 h-80 flex flex-col justify-around"
            onSubmit={handleSendOtp}
          >
            <div id="recaptcha-container"></div>
            <div className="flex flex-col gap-4 ">
              <div className="flex w-full h-16 flex-col p-2 justify-center  border border-input rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:border-ring">
                <label className="text-xs font-medium text-muted-foreground">
                  Phone
                </label>
                <div className="flex items-center gap-1">
                  <span className="text-lg">🇮🇳</span>
                  <span className="text-muted-foreground font-semibold">
                    +91
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="1220089993"
                    minLength={10}
                    maxLength={10}
                    required
                    value={phone}
                    onChange={(e) => {
                      const cleaned = e.target.value.replace(/\D/g, "");
                      setPhone(cleaned);
                    }}
                    className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground font-semibold"
                  />
                </div>
              </div>

              <div className="flex flex-col w-full h-16  border border-input rounded-md p-2 focus-within:ring-2 focus-within:ring-ring focus-within:border-ring">
                <label className="text-xs font-medium text-muted-foreground">
                  Referral Code (Optional)
                </label>
                <input
                  type="text"
                  placeholder="ENTER YOUR CODE"
                  value={referral}
                  onChange={(e) => setReferral(e.target.value)}
                  className="w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground font-semibold"
                />
              </div>
            </div>
            <h3 className="text-xs text-center text-muted-foreground leading-relaxed">
              By clicking continue, you agree to our{" "}
              <span className="font-semibold text-muted-foreground underline">
                Terms & Conditions
              </span>{" "}
              and{" "}
              <span className="font-semibold text-muted-foreground underline">
                Privacy Policy
              </span>
              .
            </h3>

            <Button
              type="submit"
              className="w-full h-12 text-lg rounded-full"
              disabled={loading}
            >
              {loading && <Spinner />}
              Continue
            </Button>

            <h1 className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <span
                className="font-semibold text-black cursor-pointer underline underline-offset-2"
                onClick={() => navigate("/login")}
              >
                Log in instead
              </span>
            </h1>
          </form>
        </div>
      )}
      {step === 2 && <OtpVerification mode={"signup"} referral={referral} initialIdentifier={phone} />}
    </>
  );
}

export default Signup;
