import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { parseISO, format } from "date-fns";
import nothingIcon from "../../assets/empty.png";
import cardIcon from "../../assets/Card.svg";
import Repayments from "./BorrowerRepayments";
import { useLoans } from "@/context/LoansContext";
import { ChevronRight } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowRight,Wallet } from "lucide-react";
import { Button } from "../ui/button";

interface BorrowerLoansSectionProps {
  showAll?: boolean; // dashboard vs all loans page
}

export default function BorrowerLoans({ showAll = false }: BorrowerLoansSectionProps) {
  const { totalLoans, activeLoans, paidLoans} = useLoans();
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const filter = query.get("filter"); // "active" | "paid" | null

  const formatCurrency = (amount: number) =>
    amount.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

  // Only approved loans can be filtered
  let approvedLoans = totalLoans.filter((loan) => loan.LoanStatus === "approved");

  if (filter === "active") approvedLoans = approvedLoans.filter((loan) => loan.loanActive);
  if (filter === "paid") approvedLoans = approvedLoans.filter((loan) => loan.loanPaid);

  // Limit to 3 if dashboard
  const approvedLoansDisplay = approvedLoans.slice(0, showAll ? approvedLoans.length : 3);
  const pendingLoansDisplay = totalLoans.filter((loan) => loan.LoanStatus === "pending").slice(0, showAll ? totalLoans.length : 3);
  const rejectedLoansDisplay = totalLoans.filter((loan) => loan.LoanStatus === "rejected").slice(0, showAll ? totalLoans.length : 3);

  const renderLoans = (loans: typeof totalLoans, status: string) => {
    if (loans.length === 0) {
      return (
        <div className="w-full items-center flex flex-col justify-center rounded-lg bg-[#1E83FF]/5 h-35">
          <img src={nothingIcon} alt="" className="w-20 h-20" />
          <h1 className="font-bold text-lg">No {status} Loans Yet</h1>
        </div>
      );
    }

    return loans.map((loan, key) => (
      <Sheet key={key}>
        <SheetTrigger asChild>
          <Card
            className="hover:shadow-md transition rounded-xl min-w-90 p-0 cursor-pointer relative"
            onClick={() => setSelectedLoanId(loan.ID)}
          >
            <CardContent className="flex items-center justify-between m-2 px-2">
              <div className="flex flex-col items-start">
                <p className="text-sm text-gray-500 font-normal">Loan Amount</p>
                <h3 className="text-xl font-bold">{formatCurrency(loan.amount)}</h3>
              </div>
              <img src={cardIcon} alt="cardIcon" className="w-12 h-12" />
              {/* Active / Paid badge */}
              {status === "approved" && (
                <span className={`border absolute top-0 right-40 px-2 py-0.5  rounded-full text-sm font-semibold ${
                  loan.loanPaid ? "bg-green-200 text-green-800" : loan.loanActive ? "bg-blue-200 text-blue-800" : "bg-gray-200 text-gray-800"
                }`}>
                  {loan.loanPaid ? "Paid" : loan.loanActive ? "Active" : "Approved"}
                </span>
              )}
            </CardContent>

            {status === "pending" && (
              <CardFooter className="bg-[#1E83FF]/5 border-black flex justify-between h-10 p-4">
                <p className="font-normal text-[#1E83FF]">Applied on </p>
                <p className="font-semibold">{format(parseISO(loan.AppliedDate), "dd-MM-yyyy")}</p>
              </CardFooter>
            )}

            {status === "approved" && (
              <CardFooter className="bg-[#1E83FF]/5 border-black flex justify-between h-10 p-4">
                <p className="font-normal text-[#1E83FF]">Issued On </p>
                <p className="font-semibold">{format(parseISO(loan.ActionDate), "dd-MM-yyyy")}</p>
              </CardFooter>
            )}

            {status === "rejected" && (
              <CardFooter className="bg-[#1E83FF]/5 border-black flex justify-between h-10 p-4">
                <p className="font-normal text-red-700">Rejected On </p>
                <p className="font-semibold">{format(parseISO(loan.ActionDate), "dd-MM-yyyy")}</p>
              </CardFooter>
            )}
          </Card>
        </SheetTrigger>

        <SheetContent className="min-w-lg overflow-y-auto pb-5">
          {loan.LoanStatus === "approved" && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-2 px-4">Repayment Schedule</h2>
              <Repayments loanId={selectedLoanId || ""} />
            </div>
          )}

          <div className="border m-8 rounded-lg p-4 space-y-2">
            <h1 className="font-bold text-xl">Loan Details</h1>
            <p><strong>Loan Code:</strong> {loan.loanCode}</p>
            <p><strong>Amount:</strong> {formatCurrency(loan.amount)}</p>
            <p><strong>Loan Type:</strong> {loan.loanType}</p>
            <p><strong>Interest Rate:</strong> {loan.interestRate}%</p>
            <p><strong>Tenure:</strong> {loan.repayTenure} months</p>
            <p><strong>Bank Name:</strong> {loan.BankName}</p>
            {loan.totalPayable !== undefined && <p><strong>Total Payable:</strong> {formatCurrency(loan.totalPayable)}</p>}
            {loan.totalPayable !== undefined && <p><strong>Total Interest:</strong> {formatCurrency(loan.totalInterest)}</p>}
            {loan.LoanStatus === "approved" && (
              <>
              <p><strong>Loan Active:</strong> {loan?.loanActive ? "Yes" : "No"}</p>
              <p><strong>Loan Paid:</strong> {loan?.loanPaid ? "Yes" : "No"}</p>
              </>
            )}
            <p><strong>Applied Date:</strong> {format(parseISO(loan.AppliedDate), "dd-MM-yyyy")}</p>
            {loan.rejectionReason && (
              <p className="w-full break-words whitespace-pre-wrap">
                <strong>Rejection Reason:</strong> {loan.rejectionReason}
              </p>
            )}
          </div>
        </SheetContent>
      </Sheet>
    ));
  };

  return (
    <div className="w-full p-4 font-robbert">
      {/* Dashboard cards */}
      {showAll && (
        <div className="flex gap-4 mb-6 w-full">
           <Card  className=" w-full border rounded-2xl bg-gradient-to-br from-white to-gray-50 dark:from-neutral-900 font-bold text-xl p-2"> 
            <div className="flex justify-between">
              <h2>Active Loans</h2>
              <Wallet className="w-5 h-5 text-primary" />
            </div>
            
            <div className="flex justify-between">
              <p>{activeLoans.length}</p>
              <Button
                size="icon"
                variant="ghost"
                className="rounded-full hover:bg-primary/10 cursor-pointer"
                onClick={() => navigate("/borrower/loans?filter=active")}
              >
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </Card>
          <Card  className="w-full border rounded-2xl bg-gradient-to-br from-white to-gray-50 dark:from-neutral-900 p-2 font-bold text-xl"> 
            <div className="flex justify-between">
              <h2>Paid Loans</h2>
              <Wallet className="w-5 h-5 text-primary" />
            </div>
            
            <div className="flex justify-between">
              <p>{paidLoans.length}</p>
              <Button
                size="icon"
                variant="ghost"
                className="rounded-full hover:bg-primary/10 cursor-pointer"
                onClick={() => navigate("/borrower/loans?filter=paid")}
              >
                <ArrowRight className="w-4 h-4 cursor-pointer" />
              </Button>
            </div>

          </Card>
           <Card className=" w-full border rounded-2xl bg-gradient-to-br from-white to-gray-50 dark:from-neutral-900 font-bold text-xl p-2"> 
            <div className="flex justify-between">
              <h2>Total Loans</h2>
              <Wallet className="w-5 h-5 text-primary" />
            </div>
            
            <div className="flex justify-between">
              <p>{totalLoans.length}</p>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Card>
        </div>
      )}

      <h2 className="text-lg font-semibold mb-4">My Loans</h2>
      <Tabs defaultValue="approved" className="w-full ">
        <TabsList className="rounded-full gap-2">
          <TabsTrigger
            value="approved"
            className="w-30 h-8 py-1.25 data-[state=active]:bg-black data-[state=active]:text-white rounded-full transition-all ease-in-out duration-300 bg-[#F3F3F5]"
          >
            Approved {showAll&& `(${approvedLoans.length})`}
          </TabsTrigger>
          <TabsTrigger
            value="pending"
            className="w-30 h-8 py-1.25 data-[state=active]:bg-black data-[state=active]:text-white rounded-full transition-all ease-in-out duration-300 bg-[#F3F3F5]"
          >
            Pending {showAll&& `(${pendingLoansDisplay.length})`}
          </TabsTrigger>
          <TabsTrigger
            value="rejected"
            className="w-30 h-8 py-1.25 data-[state=active]:bg-black data-[state=active]:text-white rounded-full transition-all ease-in-out duration-300 bg-[#F3F3F5]"
          >
            Rejected {showAll&& `(${rejectedLoansDisplay.length})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="approved" className="flex gap-5 max-w-6xl flex-wrap">
          {renderLoans(approvedLoansDisplay, "approved")}
        </TabsContent>
        <TabsContent value="pending" className="flex gap-5 max-w-6xl flex-wrap">
          {renderLoans(pendingLoansDisplay, "pending")}
        </TabsContent>
        <TabsContent value="rejected" className="flex gap-5 max-w-6xl flex-wrap">
          {renderLoans(rejectedLoansDisplay, "rejected")}
        </TabsContent>

        {!showAll && (
          <div
            className="absolute right-12 flex mt-1 cursor-pointer hover:text-muted-foreground"
            onClick={() => navigate("/borrower/loans")}
          >
            <span>View All</span>
            <ChevronRight />
          </div>
        )}
      </Tabs>
    </div>
  );
}
