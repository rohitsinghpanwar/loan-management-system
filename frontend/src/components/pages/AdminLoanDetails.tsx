// src/pages/AdminLoanDetails.tsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface LoanDetails {
  ID: string;
  BorrowerID: string;
  loanCode:string;
  fullName: string;
  amount: number;
  LoanStatus: "approved" | "pending" | "rejected";
  AppliedDate: string;
  ActionDate?: string;
  repayTenure: number;
  loanType: string;
  loanPaid:boolean;
  interestRate: number;
  totalPayable: number;
  totalInterest: number;
  rejectionReason?: string;
  loanActive: boolean;
  BankName: string;
}

export default function AdminLoanDetails() {
  const { id } = useParams();
  const [loan, setLoan] = useState<LoanDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLoanDetails = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_GO_URI}admin/loans/${id}`,
        {
          headers: {
            "x-api-key": import.meta.env.VITE_ADMIN_SECRET_KEY,
          },
        }
      );
      setLoan(response.data.loan);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to fetch loan details");
      toast.error("Failed to load loan details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoanDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh] text-gray-500">
        Loading loan details...
      </div>
    );
  }

  if (error || !loan) {
    return (
      <div className="p-6 text-center text-red-600 font-medium">
        {error || "Loan not found"}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          Loan Code - {loan.loanCode}
        </h1>
        <Button variant="outline" onClick={() => window.history.back()}>
          ← Back
        </Button>
      </div>

      <Card className="bg-white shadow-sm border rounded-xl">
        <CardContent className="space-y-4 py-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-semibold text-gray-600">Borrower Name</p>
              <p>{loan.fullName}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-600">Bank Name</p>
              <p>{loan.BankName}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-600">Amount</p>
              <p>₹{loan.amount.toLocaleString()}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-600">Interest Rate</p>
              <p>{loan.interestRate}%</p>
            </div>
            <div>
              <p className="font-semibold text-gray-600">Repay Tenure</p>
              <p>{loan.repayTenure} months</p>
            </div>
            <div>
              <p className="font-semibold text-gray-600">Total Payable</p>
              <p>₹{loan.totalPayable?.toLocaleString() || "-"}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-600">Total Interest</p>
              <p>₹{loan.totalInterest?.toLocaleString() || "-"}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-600">Applied Date</p>
              <p>{format(parseISO(loan.AppliedDate), "dd/MM/yyyy")}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-600">Action Date</p>
              <p>
                {loan.ActionDate
                  ? format(parseISO(loan.ActionDate), "dd/MM/yyyy")
                  : "-"}
              </p>
            </div>
            <div>
              <p className="font-semibold text-gray-600">Loan Type</p>
              <p>{loan.loanType}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-600">Loan Active</p>
              <p>{loan.loanActive ? "Yes" : "No"}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-600">Loan Paid</p>
              <p>{loan.loanPaid? "Yes" : "No "}</p>
            </div>
          </div>

          {loan.LoanStatus === "rejected" && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="font-semibold text-red-700">Rejection Reason:</p>
              <p className="text-red-600">{loan.rejectionReason}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
