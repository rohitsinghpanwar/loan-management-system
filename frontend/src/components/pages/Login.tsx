import { Button } from "../ui/button";
import axios from "axios";
import {useState } from "react";
import googleIcon from "../../assets/google.png";
import { Spinner } from "../ui/spinner";
import { toast } from "sonner";
import OtpVerification from "./OtpVerification";
import { useNavigate } from "react-router-dom";

import { useAuth } from "./AuthContext";

function Login() {
  const [identifier, setIdentifier] = useState("");
  const [loading,setLoading]=useState(false)
  const [step, setStep] = useState(1);
  const navigate=useNavigate()
  const {user}=useAuth()
  console.log(user)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true)
    try {
     await axios.post(
        `${import.meta.env.VITE_NODE_URI}api/v1/borrower/login`,
        { identifier,mode:"login"},
        { withCredentials: true }
      );
      setStep(2)
    } catch (err: any) {
      console.error(err.response?.data || err);
      toast.error(err.response?.data?.message || "Login failed");
    }
    finally{
      setLoading(false)
    }
  };

  return (
    <>
    {step===1 &&(
      <div className="flex flex-col items-center justify-center h-[90vh]">
      <form
        onSubmit={handleLogin}
        className="w-90 h-100 flex flex-col justify-center gap-5"
      >
        <div className="flex w-full h-16 flex-col p-2 justify-center border border-input rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:border-ring">
          <label htmlFor="identifier" className="font-medium text-xs">
            Email/Phone
          </label>
          <input
            id="identifier"
            type="text"
            name="identifier"
            required
            placeholder="Enter Email/Phone"
            value={identifier} // ✅ bind state
            onChange={(e) => setIdentifier(e.target.value)} // ✅ update state
            className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground font-semibold"
          />
        </div>
        <h3 className="text-xs p-5 text-gray-500">
          By clicking continue, you agree to our{" "}
          <span className="font-bold  underline text-muted-foreground">Terms & Conditions</span> and{" "}
          <span className="font-bold underline text-muted-foreground">Privacy Policy</span>
        </h3>
        <Button type="submit" className="w-full rounded-4xl h-14 text-lg" disabled={loading}>
          {loading &&(
            <Spinner/>
          )}
          
          Continue
        </Button>
        <h1 className="self-center font-bold text-gray-500">Or</h1>
        <Button
          variant={"outline"}
          className="h-14 rounded-4xl border border-black text-lg"
          disabled={true}
        >
          <img src={googleIcon} alt="GoogleIcon" className="w-6 h-6" />
          Continue with Google
        </Button>
         <h1 className="text-center text-sm text-muted-foreground">
          New User?{" "}
          <span className="font-semibold text-black cursor-pointer underline underline-offset-2" onClick={()=>navigate("/signup")}>
            Create New Account
          </span>
        </h1>
      </form>
    </div>
    )
    }
{step===2 && <OtpVerification mode={"login"} initialIdentifier={identifier}/>}

    </>
    
  );
}

export default Login;
