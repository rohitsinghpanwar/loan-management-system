import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Activity, Wallet } from "lucide-react";
import { motion } from "framer-motion";
import { useLoans } from "@/context/LoansContext";

interface EligibilityResults {
  emi: number;
  dtiRatio: number;
  affordableLoanAmount: number;
  approvalLikelihood: number;
  totalInterest: number;
}



export default function BorrowerEligibilityResults() {
  const navigate = useNavigate();
  const [recentResults, setRecentResults] = useState<EligibilityResults | null>(
    null
  );

  useEffect(() => {
    const storedResults = localStorage.getItem("eligibilityResults");
    if (storedResults) {
      setRecentResults(JSON.parse(storedResults));
    }
  }, []);
  const {activeLoans}=useLoans()

  const handleEligibilityClick = () => navigate("/borrower/eligible");
  const handleActiveLoansClick = () => navigate("/borrower/loans");

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 px-4 gap-14 max-w-full">
      {/* Card 1: Active Loans */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="h-full border rounded-2xl bg-gradient-to-br from-white to-gray-50 dark:from-neutral-900 dark:to-neutral-800 shadow-sm hover:shadow-md transition-all duration-300 p-2">
          <CardContent className="flex flex-col justify-between h-full p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-muted-foreground">
                Active Loans
              </p>
              <Wallet className="w-5 h-5 text-primary" />
            </div>

            <div className="flex items-end justify-between mt-auto">
              <h3 className="text-4xl font-extrabold text-foreground">
                {activeLoans.length}
              </h3>
              <Button
                size="icon"
                variant="ghost"
                className="rounded-full hover:bg-primary/10 cursor-pointer"
                onClick={handleActiveLoansClick}
              >
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Card 2: Check Your Eligibility */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <Card className="border rounded-2xl bg-gradient-to-br from-white to-gray-50 dark:from-neutral-900 dark:to-neutral-800 shadow-sm hover:shadow-md transition-all duration-300 p-2">
          <CardContent className="flex flex-col justify-between items-center text-center h-full p-0">
            <div className="flex flex-col items-center">
              <div className="bg-primary/10 p-3 rounded-full">
                <Activity className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-robbert font-semibold text-xl text-foreground">
                Check Your Eligibility
              </h3>
              <p className="text-sm text-muted-foreground">
                Find out your loan approval odds in just a few steps
              </p>
            </div>

            <Button
              variant="default"
              className="mt-1 gap-2 rounded-full font-medium cursor-pointer"
              onClick={handleEligibilityClick}
            >
              Start Check <ArrowRight className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Card 3: Recent Eligibility Results */}
      {recentResults && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border rounded-2xl bg-gradient-to-br from-[#FCFCF9] to-gray-50 dark:from-neutral-900 dark:to-neutral-800 shadow-sm hover:shadow-md transition-all duration-300 p-2">
            <CardContent className="flex flex-col justify-betwee h-full">
              <div className="flex flex-col items-center gap-1 ">
                <div className="bg-green-100 dark:bg-green-900/40 p-2 rounded-full">
                  <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-robbert font-semibold text-lg text-foreground text-center">
                  Recent Eligibility Results
                </h3>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-muted-foreground">
                    Affordable loan amount
                  </span>
                  <span>
                    ₹{recentResults?.affordableLoanAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Debt-to-Income Ratio
                  </span>
                  <span
                    className={`font-semibold ${
                      recentResults.dtiRatio <= 30
                        ? "text-green-600"
                        : recentResults.dtiRatio <= 40
                        ? "text-yellow-600"
                        : "text-red-500"
                    }`}
                  >
                    {recentResults.dtiRatio}%{" "}
                    <span className="text-xs text-muted-foreground ml-1">
                      {recentResults.dtiRatio <= 30
                        ? "(Healthy)"
                        : recentResults.dtiRatio <= 45
                        ? "(Moderate)"
                        : "(High)"}
                    </span>
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Approval Rate
                  </span>
                  <span
                    className={`font-semibold ${
                      recentResults.approvalLikelihood >= 80
                        ? "text-green-600"
                        : recentResults.approvalLikelihood >= 50
                        ? "text-yellow-600"
                        : "text-red-500"
                    }`}
                  >
                    {recentResults.approvalLikelihood}%{" "}
                    <span className="text-xs text-muted-foreground ml-1">
                      {recentResults.approvalLikelihood >= 80
                        ? "(Great)"
                        : recentResults.approvalLikelihood >= 50
                        ? "(Moderate)"
                        : "(Low)"}
                    </span>
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
