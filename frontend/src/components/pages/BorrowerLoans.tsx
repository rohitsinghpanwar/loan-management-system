import { useState, type ChangeEvent, type FormEvent } from "react";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectLabel,
  SelectGroup
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Spinner } from "../ui/spinner";
import axios from "axios";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

export default function BorrowerLoans() {
  const [step, setStep] = useState(1);
  const {user}=useAuth()
  const [formData, setFormData] = useState({
    borrowerId :user?._id,
    amount: "",
    repayTenure: "",
    loanType: "",
    interestRate: "",
    fullName:user?.fullName
  });

  // Loan types and interestRate mapping
  const loanTypes: Record<string, number> = {
    "Car Loan": 9.5,
    "Home Loan": 8.25,
    "Business Loan": 11.75,
    "Education Loan": 10.0,
    "Personal Loan": 12.5,
  };

  const repaymentrepayTenures = ["6 months", "12 months", "18 months", "24 months", "30 months"];
  const [loading,setLoading]=useState(false)
  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, amount: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement> | React.MouseEvent) => {
    e.preventDefault();
    console.log("Submitted Data:", formData);
    setLoading(true)
    const submitData = {
        amount: parseFloat(formData.amount), // Convert string to number
        repayTenure: parseInt(formData.repayTenure, 10), // Convert string to integer
        loanType: formData.loanType, // String, e.g., "Car Loan"
        interestRate: parseFloat(formData.interestRate), // Convert string to number
        borrowerId: formData.borrowerId, // Must be a valid UUID string
        fullName: formData.fullName
    };
    console.log(submitData)
    try {
      await axios.post("http://localhost:4000/loans/apply",submitData,{ headers: { "x-api-key":`${import.meta.env.VITE_BORROWER_SECRET_KEY}` }})
      toast.success("Loan Applied Successfully. Our admin will approve it soon!")
      setStep(1)
    formData.amount=""
    formData.repayTenure=""
    formData.loanType=""
    formData.interestRate=""

    } catch (error) {
      toast.error("Error in applying loan")
      console.log("Error in applying loan",error)
    }finally{
      setLoading(false)
    }
  };
  const calculateEMI = (amount: number, interestRate: number, months: number): number => {
  const principal = amount;
  const monthlyRate = interestRate / 12 / 100; // Convert annual rate to monthly decimal
  const tenure = months;

  if (monthlyRate === 0) return principal / tenure;

  const emi =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) /
    (Math.pow(1 + monthlyRate, tenure) - 1);

  return Math.round(emi); // round to nearest rupee
};


  const nextStep = () => setStep(2);
  const prevStep = () => setStep(1);

  const nextDisabled =
    !formData.amount.trim() ||
    !formData.repayTenure.trim() ||
    !formData.loanType.trim() ||
    !formData.interestRate.trim();
  const fullName = user?.fullName || "User"
  const nameParts = fullName.trim().split(" ");
  const initials =
    nameParts.length === 1
      ? nameParts[0][0]
      : `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`;
  const months = parseInt(formData.repayTenure) || 0;
const amount = parseFloat(formData.amount) || 0;
const rate = parseFloat(formData.interestRate) || 0;

const estimatedEMI = months && amount && rate
  ? calculateEMI(amount, rate, months)
  : 0;

  return (
    <div className="flex w-full min-h-screen font-head">
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold">
            Hi {fullName.split(" ").slice(0, 1)}
          </h1>
          <p className="text-muted-foreground text-xl">
            Welcome back, here’s your loan overview
          </p>
        </div>

        <div className="flex items-center gap-2 bg-gray-100  w-55 h-12 rounded-full p-1">
          <div className="w-10 h-10 p-2 rounded-full bg-black text-white flex items-center justify-center text-md font-bold">
            {initials}
          </div>
          <span className="font-normal text-lg">{fullName}</span>
        </div>
      </div>
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-10 relative w-lg">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold",
                step >= 1 ? "bg-black text-white" : "bg-gray-300 text-gray-600"
              )}
            >
              1
            </div>
            <h1 className="font-bold">Step 1</h1>
            <h2>Loan Details</h2>
          </div>

          <div className="absolute left-15 right-19 top-4 h-0.5  bg-gray-200">
            <div
              className="h-0.5 bg-black transition-all duration-500"
              style={{ width: step === 1 ? "0%" : "100%" }}
            />
          </div>

          <div className="flex items-center flex-col">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold",
                step === 2 ? "bg-black text-white" : "bg-gray-300 text-gray-600"
              )}
            >
              2
            </div>
            <h1 className="font-bold">Step 2</h1>
            <h2>Review & Submit</h2>
          </div>
        </div>

        {/* Step 1: Loan Details */}
        {step === 1 && (
          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {/* Loan Amount */}
              <div className="flex w-full h-16 flex-col p-2 justify-center  border border-input rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:border-ring">
                <Label htmlFor="amount">Loan Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  name="amount"
                  placeholder="Enter amount"
                  required
                  value={formData.amount}
                  onChange={handleAmountChange}
                  min={10000}
                  className="focus-visible:ring-0 border-none text-foreground placeholder:text-muted-foreground font-semibold shadow-none p-0"
                />
              </div>

              {/* Repayment repayTenure */}
              <div className="flex w-full h-16 flex-col p-2 justify-center  border border-input rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:border-ring">
                <Label>Repayment repayTenure</Label>
                <Select
                  onValueChange={(value) => setFormData({ ...formData, repayTenure: value })}
                  value={formData.repayTenure}>
                  <SelectTrigger className="focus-visible:ring-0 border-none text-foreground placeholder:text-muted-foreground font-semibold w-full shadow-none p-0">
                    <SelectValue placeholder="Select repayTenure" />
                  </SelectTrigger>
                  <SelectContent className="focus-visible:ring-0 border-none text-foreground placeholder:text-muted-foreground font-semibold">
                    <SelectGroup>
                    <SelectLabel>Repayment Months</SelectLabel>
                    {repaymentrepayTenures.map((repayTenure) => (
                      <SelectItem key={repayTenure} value={repayTenure}>
                        {repayTenure}
                      </SelectItem>
                    ))}
                    </SelectGroup>
                  </SelectContent>

                </Select>
              </div>
            </div>

            {/* Loan Type */}
            <div className="flex w-full h-16 flex-col p-2 justify-center  border border-input rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:border-ring">
              <Label>Loan Type</Label>
              <Select
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    loanType: value,
                    interestRate: loanTypes[value].toString(),
                  })
                }
                value={formData.loanType}
              >
                <SelectTrigger className="focus-visible:ring-0 border-none text-foreground placeholder:text-muted-foreground font-semibold w-full shadow-none p-0">
                  <SelectValue placeholder="Select loan type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                  <SelectLabel>Type of Loan</SelectLabel>
                  {Object.entries(loanTypes).map(([type, rate]) => (
                    <SelectItem key={type} value={type}>
                      {type} ({rate}%)
                    </SelectItem>
                  ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <Button
              type="button"
              onClick={nextStep}
              className="rounded-full w-40 h-11 text-lg"
              disabled={nextDisabled}
            >
              Next
            </Button>
          </form>
        )}

        {/* Step 2: Review & Submit */}
        {step === 2 && (
          <div className="flex flex-col gap-6">
          <Card className="p-0">
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2 text-sm flex justify-between flex-wrap">
                <p className="flex flex-col text-muted-foreground text-sm">
                  <strong className="font-bold text-lg text-black">₹{formData.amount}</strong>
                  Loan Amount
                </p>
                <p className="flex flex-col text-muted-foreground text-sm">
                  <strong className="font-bold text-lg text-black">{formData.repayTenure}</strong>
                  Repayment repayTenure
                </p>
                <p className="flex flex-col text-muted-foreground text-sm">
                  <strong className="font-bold text-lg text-black">{formData.loanType}</strong>
                  Loan Type
                </p>
                <p className="flex flex-col text-muted-foreground text-sm">
                  <strong className="font-bold text-lg text-black">{formData.interestRate}%</strong>
                  Interest Rate
                </p>
              </div>
            </CardContent>

            <CardFooter className="flex justify-between h-8 bg-[#1E83FF]/20 rounded-b-xl">
            
                <h1 className="text-xs font-normal text-[#1E83FF]">Estimated Monthly Payment</h1>
                <h2 className="font-semibold text-xs">₹{estimatedEMI.toLocaleString()}</h2>

              
            </CardFooter>
          </Card>
          <div className="flex justify-between">
            <Button
                variant="outline"
                onClick={prevStep}
                className="rounded-full w-48 h-14 py-4 px-5 font-semibold text-lg"
              >
                Previous
              </Button>
              <Button
                onClick={handleSubmit}
                className="rounded-full w-48 h-14 bg-black py-4 px-5 text-white font-semibold text-lg"
              >
                {loading &&(
                  <Spinner/>
                )}
                Submit Application
              </Button>
          </div>
          </div>
        )}
      </div>
    </div>
  );
}
