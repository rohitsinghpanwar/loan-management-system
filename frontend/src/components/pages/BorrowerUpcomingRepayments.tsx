import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { format, parseISO, isAfter } from "date-fns";
import { Clock } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";

interface Repayment {
  id: string;
  loanId: string;
  loanCode:string;
  bankName: string;
  amount: number;
  interestRate: number;
  dueDate: string;
  status: string;
  loanAmount: string;
  loanType: string;
}

export default function BorrowerUpcomingRepayments() {
  const [repayments, setRepayments] = useState<Repayment[]>([]);
  const [loading, setLoading] = useState(false);
  const [repayingId, setRepayingId] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchRepayments = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_GO_URI}loans/all-repayments/${user?._id}`,
        {
          headers: { "x-api-key": import.meta.env.VITE_BORROWER_SECRET_KEY },
        }
      );

      const data: Repayment[] = res.data.repayments.map((r: any) => ({
        id: r.ID,
        loanId: r.loanId,
        loanCode:r.loanCode,
        bankName: r.bankName || "IDFC First Bank",
        amount: r.amount,
        interestRate: r.interestRate,
        dueDate: r.dueDate,
        status: r.status,
        loanAmount: r.loanAmount,
        loanType: r.loanType,
      }));

      const now = new Date();

      const upcoming = data.filter(
        (r) => r.status !== "paid" && isAfter(parseISO(r.dueDate), now)
      );

      const nextRepaymentsMap: Record<string, Repayment> = {};
      upcoming.forEach((r) => {
        if (
          !nextRepaymentsMap[r.loanId] ||
          parseISO(r.dueDate).getTime() <
            parseISO(nextRepaymentsMap[r.loanId].dueDate).getTime()
        ) {
          nextRepaymentsMap[r.loanId] = r;
        }
      });

      const nextRepayments = Object.values(nextRepaymentsMap).sort(
        (a, b) => parseISO(a.dueDate).getTime() - parseISO(b.dueDate).getTime()
      );
      setRepayments(nextRepayments);
    } catch (err) {
      console.error("Error fetching repayments:", err);
      setRepayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) fetchRepayments();
  }, [user?._id]);

  const handleRepayNow = async (id: string,amount:number) => {
    try {
      setRepayingId(id);
      await axios.patch(
        `${import.meta.env.VITE_GO_URI}loans/repayments/repay/${id}`,
        {},
        { headers: { "x-api-key": import.meta.env.VITE_BORROWER_SECRET_KEY } }
      );
      toast.success(`Repayment of ${amount} done successfully`);
      await fetchRepayments(); // Refresh after repayment
    } catch (err) {
      console.error("Error during repayment:", err);
    } finally {
      setRepayingId(null);
    }
  };

  const formatCurrency = (amount: number) =>
    amount.toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    });

  if (loading)
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin w-8 h-8 border-4 border-gray-300 border-t-primary rounded-full"></div>
      </div>
    );

  if (!repayments.length)
    return (
      <div className="flex flex-col items-center justify-center h-40 text-center">
        <Clock className="w-6 h-6 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">No upcoming repayments</p>
      </div>
    );

  return (
    <div className="flex flex-col  p-4 items-center font-robbert gap-5">
      <h1 className="text-xl">Upcoming Repayments</h1>
      {repayments.map((repay) => (
        <Card
          key={repay.id}
          className="p-3 border rounded-xl bg-gradient-to-br from-[#FCFCF9] to-gray-50 hover:shadow-md transition-all w-full"
        >
          <CardContent className="flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm text-gray-900">
                Loan Code: {repay.loanCode}
              </h3>
              <p className="text-sm">{repay.status.toUpperCase()}</p>
            </div>
            <div className="flex justify-between">
              <div>
              <p className="text-xs text-muted-foreground mb-1">Due Date</p>
              <p className="text-base font-medium text-gray-900">
                {format(parseISO(repay.dueDate), "dd MMM yyyy")}
              </p>
              </div>
              <div className="text-end">
                <p className="text-xs text-muted-foreground mb-1">Interest Rate</p>
              <p className="text-base font-medium text-gray-900">
                {repay.interestRate}%
              </p>
              </div>
            </div>
            <div className="flex justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Type of Loan
                </p>
                <p className="text-base font-medium text-gray-900">
                  {repay.loanType}
                </p>
              </div>
              <div className="text-end">
                <p className="text-xs text-muted-foreground mb-1">
                  Loan Amount
                </p>
                <p className="text-base font-medium text-gray-900">
                  {repay.loanAmount}
                </p>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Repayment Amount
                </p>
                <p className="text-lg font-semibold text-primary">
                  {formatCurrency(repay.amount)}
                </p>
              </div>

              <button
                onClick={() => handleRepayNow(repay.id,repay.amount)}
                disabled={repayingId !== null}
                className={`flex items-center gap-1 text-sm font-medium border border-black p-2 rounded-lg ${
                  repayingId === repay.id
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-primary hover:text-muted-foreground"
                }`}
              >
                {repayingId === repay.id ? "Processing..." : "Repay Now"}
              </button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
