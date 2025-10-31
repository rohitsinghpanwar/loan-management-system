import { type ChangeEvent, type FormEvent, useState,useEffect } from "react";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

function BorrowerEligibility() {
  const [step, setStep] = useState(1);
  const navigate=useNavigate()
  const [formData, setFormData] = useState({
    salaryAfterTax: "",
    monthlyExpenses: "",
    interestRate: "",
    tenure: "",
    employmentStatus: "",
  });
  const [results, setResults] = useState<{
    emi: number;
    dtiRatio: number;
    affordableLoanAmount: number;
    approvalLikelihood: number;
    totalInterest: number;
  } | null>(null);

  useEffect(() => {
    if (results) {
      localStorage.setItem("eligibilityResults", JSON.stringify(results));
    }
  }, [results]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const calculateEligibility = () => {
    const salaryAfterTax = parseFloat(formData.salaryAfterTax) || 0;
    const expenses = parseFloat(formData.monthlyExpenses) || 0;
    const interestRate = parseFloat(formData.interestRate) / 100 / 12; // Convert annual % to monthly decimal
    const tenureMonths = parseInt(formData.tenure) || 36;
    const employmentStatus = formData.employmentStatus;

    // Calculate DTI
    const dtiRatio = salaryAfterTax ? (expenses / salaryAfterTax) * 100 : 0;

    // Calculate Affordable Loan Amount (EMI ≤ 40% of salary)
    const maxEMI = salaryAfterTax * 0.4;
    const r = interestRate;
    const n = tenureMonths;
    const affordableLoanAmount =
      maxEMI * (Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n));

    // Calculate EMI for affordable loan amount
    const emi = affordableLoanAmount
      ? (affordableLoanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
      : 0;

    // Calculate Total Interest
    const totalInterest = emi * tenureMonths - affordableLoanAmount;

    // Approval Likelihood (weighted score)
    let score = 0;
    if (salaryAfterTax <= 0) {
      score = 0; // No income, no eligibility
    } else {
      score += dtiRatio < 80 ? Math.max(5, 30 - dtiRatio / 2.67) : 5; // 30% weight
      const disposableIncomeRatio = salaryAfterTax ? ((salaryAfterTax - expenses) / salaryAfterTax) * 100 : 0;
      score += disposableIncomeRatio > 20 ? Math.min(40, disposableIncomeRatio / 2) : 5; // 40% weight
      score += employmentStatus === "employed" ? 30 : 20; // 30% weight
    }
    const approvalLikelihood = Math.min(Math.round(score), 100);

    setResults({
      emi: Math.round(emi),
      dtiRatio: Math.round(dtiRatio * 10) / 10,
      affordableLoanAmount: Math.round(affordableLoanAmount),
      approvalLikelihood,
      totalInterest: Math.round(totalInterest),
    });
    setStep(2);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      !formData.salaryAfterTax ||
      !formData.monthlyExpenses ||
      !formData.interestRate ||
      !formData.tenure ||
      !formData.employmentStatus
    ) {
      toast.error("Please fill all required fields.");
      return;
    }
    calculateEligibility();
  };

  const handleBack = () => {
    setStep(1);
    setResults(null);
  };


  return (
    <div className="flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 font-robbert mt-5 ">
      <div className="flex flex-col items-center w-full max-w-md border rounded-xl gap-5 p-5 bg-[#FCFCF9] sm:max-w-lg shadow-lg">
        <div className="flex flex-col justify-center items-center text-center">
          <h1 className="font-extrabold text-2xl sm:text-3xl">
            {step === 1 ? "Check Your Loan Eligibility" : "Your Eligibility Results"}
          </h1>
          <h2 className="text-base sm:text-lg text-muted-foreground mt-2">
            {step === 1
              ? "Enter your details to see your loan approval odds"
              : "Here’s how likely you are to get approved"}
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            Step {step} of 2
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
            <div className="flex w-full h-16 flex-col p-2 justify-center border border-input rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:border-ring">
              <label htmlFor="salaryAfterTax" className="font-medium text-xs">
                Monthly Income After Tax (₹)
              </label>
              <input
                type="number"
                name="salaryAfterTax"
                value={formData.salaryAfterTax}
                onChange={handleChange}
                required
                placeholder="Enter your monthly Income"
                className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground font-semibold"
              />
            </div>
            <div className="flex w-full h-16 flex-col p-2 justify-center border border-input rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:border-ring">
              <label htmlFor="monthlyExpenses" className="font-medium text-xs">
                Monthly Expenses (₹)
              </label>
              <input
                type="number"
                name="monthlyExpenses"
                value={formData.monthlyExpenses}
                onChange={handleChange}
                required
                placeholder="Enter your monthly expenses"
                className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground font-semibold"
              />
            </div>
            <div className="flex w-full h-16 flex-col p-2 justify-center border border-input rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:border-ring">
              <label className="font-medium text-xs">Interest Rate (%)</label>
              <Select
                onValueChange={(value) => handleSelectChange("interestRate", value)}
                value={formData.interestRate}
              >
                <SelectTrigger className="w-full outline-none border-hidden p-0 shadow-none focus-visible:ring-0">
                  <SelectValue placeholder="Choose interest rate" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup className="border">
                    <SelectItem value="8">8%</SelectItem>
                    <SelectItem value="10">10%</SelectItem>
                    <SelectItem value="12">12%</SelectItem>
                    <SelectItem value="14">14%</SelectItem>
                    <SelectItem value="16">16%</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-full h-16 flex-col p-2 justify-center border border-input rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:border-ring">
              <label className="font-medium text-xs">Loan Tenure (Months)</label>
              <Select
                onValueChange={(value) => handleSelectChange("tenure", value)}
                value={formData.tenure}
              >
                <SelectTrigger className="w-full outline-none border-hidden p-0 shadow-none focus-visible:ring-0">
                  <SelectValue placeholder="Choose tenure" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup className="border">
                    <SelectItem value="12">12 Months</SelectItem>
                    <SelectItem value="24">24 Months</SelectItem>
                    <SelectItem value="36">36 Months</SelectItem>
                    <SelectItem value="48">48 Months</SelectItem>
                    <SelectItem value="60">60 Months</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-full h-16 flex-col p-2 justify-center border border-input rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:border-ring">
              <label className="font-medium text-xs">Employment Status</label>
              <Select
                onValueChange={(value) => handleSelectChange("employmentStatus", value)}
                value={formData.employmentStatus}
              >
                <SelectTrigger className="w-full outline-none border-hidden p-0 shadow-none focus-visible:ring-0">
                  <SelectValue placeholder="Choose employment status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup className="border">
                    <SelectItem value="employed">Employed</SelectItem>
                    <SelectItem value="self-employed">Self-Employed</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <Button
              type="submit"
              className="w-full h-14 text-lg rounded-full"
              disabled={
                !formData.salaryAfterTax ||
                !formData.monthlyExpenses ||
                !formData.interestRate ||
                !formData.tenure ||
                !formData.employmentStatus
              }
            >
              Check Eligibility
            </Button>
          </form>
        ) : (
          <div className="w-full flex flex-col gap-4">
            <div className="p-4 bg-green-100 rounded-md text-center">
              <p className="text-lg sm:text-xl font-semibold">
                Approval Likelihood: {results?.approvalLikelihood}%
              </p>
              <p className="text-sm text-muted-foreground">
                {results?.approvalLikelihood && results.approvalLikelihood >= 80
                  ? "Great chance of approval!"
                  : results?.approvalLikelihood && results.approvalLikelihood >= 50
                  ? "Moderate chance. Consider improving your financial profile."
                  : "Low chance. Try increasing income or reducing expenses."}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-md">
                <p className="font-semibold">Affordable Loan Amount</p>
                <p className="text-xl sm:text-2xl">
                  ₹{results?.affordableLoanAmount.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  Maximum loan you can afford based on your income
                </p>
              </div>
              <div className="p-4 border rounded-md">
                <p className="font-semibold">Monthly EMI</p>
                <p className="text-xl sm:text-2xl">₹{results?.emi.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">
                  Based on {formData.interestRate}% interest rate for {formData.tenure} months
                </p>
              </div>
              <div className="p-4 border rounded-md">
                <p className="font-semibold">Debt-to-Income Ratio</p>
                <p className="text-xl sm:text-2xl">{results?.dtiRatio}%</p>
                <p className="text-sm text-muted-foreground">
                  {results?.dtiRatio && results.dtiRatio <=30
                    ? "Healthy ratio!"
                    :results?.dtiRatio && results.dtiRatio <=40
                    ?"Moderate ratio!"
                    : "High ratio, consider reducing expenses."}
                </p>
              </div>
              <div className="p-4 border rounded-md">
                <p className="font-semibold">Total Interest Payable</p>
                <p className="text-xl sm:text-2xl">
                  ₹{results?.totalInterest.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  Total interest for your loan at {formData.interestRate}% over{" "}
                  {formData.tenure} months
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleBack}
                className="flex-1 h-12 sm:h-14 text-base sm:text-lg rounded-full bg-gray-200 text-black hover:bg-gray-300"
              >
                Back
              </Button>
              <Button
                onClick={()=>navigate("/borrower/apply-loan")}
                className="flex-1 h-12 sm:h-14 text-base sm:text-lg rounded-full"
              >
                Apply Now
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BorrowerEligibility;