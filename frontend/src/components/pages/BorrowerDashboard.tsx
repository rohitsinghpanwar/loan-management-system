import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BorrowerEligibilityResults from "./BorrowerEligibilityResults";
import BorrowerLoans from "./BorrowerLoans";
import { useLoans } from "@/context/LoansContext";

function BorrowerDashboard() {
  const navigate = useNavigate();
  const {totalApproved}=useLoans()
  const formatCurrency = (amount: number) =>
    amount.toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits:0,
    });
  return (
    <div className="font-robbert">

      {/* TOP SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:gap-12 mb-8">
        {/* Left Card: Total Loan Approved */}
        <Card className=" flex flex-col items-center justify-center col-span-2 bg-gradient-to-bl to-violet-300  border-none h-46 ">
          <CardContent className="flex flex-col items-center justify-center w-82 h-28 g-3">
            <div className="flex flex-col items-center justify-center">
              <p className="text-sm text-muted-foreground">
                Total Loan Approved
              </p>
              <h2 className="text-3xl font-extrabold mt-1 text-muted-foreground">
                {formatCurrency(totalApproved)}
              </h2>
            </div>
            <Button className="mt-4 w-82 h-13 rounded-full text-white bg-black cursor-pointer" onClick={()=>navigate("/borrower/apply-loan")}>
              Apply for a Loan
            </Button>
          </CardContent>
        </Card>

        {/* Right Card: Quick Access */}
        <Card className="flex flex-col items-center justify-center bg-[#F4F9FF] w-90 h-46 rounded-lg">
          <CardHeader className="w-full text-center">
            <CardTitle className="text-lg font-semibold">
              Quick Access
            </CardTitle>
          </CardHeader>
          <CardContent className="flex">
            <div
              className="flex flex-col w-28 h-22 gap-3 items-center"
              onClick={() => navigate("/borrower/loans")}
            >
              <div className="w-16 h-16 flex items-center justify-center bg-white rounded-full">
                <Plus className="w-6 h-6 cursor-pointer " />
              </div>
              <p className="text-xs font-medium">My Loans</p>
            </div>
            <div
              className="flex flex-col w-30 h-22 gap-3 items-center"
              onClick={() => navigate("/borrower/apply-loan")}
            >
              <div className="w-16 h-16 flex items-center justify-center bg-white rounded-full">
                <Plus className="w-6 h-6 cursor-pointer" />
              </div>
              <p className="text-xs font-medium">Apply for a new loan</p>
            </div>
            <div className="flex flex-col w-28 h-22 gap-3 items-center" onClick={()=>navigate("/borrower/repayments")}>
              <div className="w-16 h-16 flex items-center justify-center bg-white rounded-full">
                <Plus className="w-6 h-6 cursor-pointer" />
              </div>
              <p className="text-xs font-medium">Repayments</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <BorrowerEligibilityResults />
      <BorrowerLoans showAll={false} />
    </div>
  );
}

export default BorrowerDashboard
