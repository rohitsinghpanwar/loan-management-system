import React, { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import axios from "axios";
import { parseISO, format } from "date-fns";

interface RepaymentItem {
  id: string;
  bankName: string;
  totalAmount: number;
  interest: number;
  repaid: number;
  dueDate: string;
  status?: string;
  paidDate:string;
}

interface RepaymentsProps {
  loanId: string;
}

const BorrowerRepayments: React.FC<RepaymentsProps> = ({ loanId }) => {
  const [repayments, setRepayments] = useState<RepaymentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [repay, setRepay] = useState(false);

  const fetchRepayments = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_GO_URI}loans/repayments/${loanId}`,
        {
          headers: {
            "x-api-key": `${import.meta.env.VITE_BORROWER_SECRET_KEY}`,
          },
        }
      );

      const mappedRepayments: RepaymentItem[] = res.data.repayments.map(
        (item: any) => ({
          id: item.ID,
          bankName: item.bankName || "IDFC First Bank",
          totalAmount: item.amount || 0,
          interest: item.interestRate || 0,
          repaid: item.status === "paid" ? item.amount : 0,
          dueDate: item.dueDate,
          status: item.status,
          paidDate:item.paidDate,
        })
      );

      setRepayments(mappedRepayments);
    } catch (error) {
      console.error("Error fetching repayments:", error);
      setRepayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loanId) fetchRepayments();
  }, [loanId]);

  const formatCurrency = (amount: number) =>
    amount.toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    });

  const getDaysLeft = (dueDateStr: string) => {
    const dueDate = new Date(dueDateStr);
    const now = new Date();
    const diffMs = dueDate.getTime() - now.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  };

  const handleRepayNow = async (id: string) => {
    setRepay(true);
    try {
      await axios.patch(
        `${import.meta.env.VITE_GO_URI}loans/repayments/repay/${id}`,
        {},
        {
          headers: {
            "x-api-key": `${import.meta.env.VITE_BORROWER_SECRET_KEY}`,
          },
        }
      );
      await fetchRepayments(); // Refresh repayments
    } catch (error) {
      console.error(error);
    } finally {
      setRepay(false);
    }
  };

  if (loading)
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm text-gray-500">Loading repayments...</p>
        </div>
      </div>
    );

  if (!repayments.length)
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-gray-500">No repayments found for this loan.</p>
      </div>
    );

  // Get first unpaid repayment index
  const firstUnpaidIndex = repayments.findIndex(r => r.status !== "paid");

  return (
    <div className="w-full h-full flex flex-col">
      <div className="overflow-y-auto flex-1">
        <div className="relative">
          {repayments.map((item, index) => {
            const daysLeft = getDaysLeft(item.dueDate);
            const isPaid = item.status === "paid";

            // Only allow repay if this is the first unpaid repayment
            const canRepay = !isPaid && index === firstUnpaidIndex;

            // Badge and border colors
            const borderColor = isPaid
              ? "border-emerald-500"
              : daysLeft <= 3
              ? "border-red-500"
              : "border-gray-200";

            const badgeColor = isPaid
              ? "bg-emerald-600"
              : daysLeft <= 3
              ? "bg-red-500"
              : daysLeft <= 31
              ? "bg-blue-500"
              : "bg-gray-900";

            const badgeText = isPaid
              ? "Paid"
              : daysLeft <= 3
              ? `${daysLeft} day${daysLeft > 1 ? "s" : ""} left`
              : daysLeft <= 31
              ? `${daysLeft} days left`
              : format(parseISO(item.dueDate), "dd/MM/yyyy");

            const totalRepaid = repayments
              .filter((r) => r.status === "paid")
              .reduce((sum, r) => sum + r.totalAmount, 0);

            return (
              <div key={item.id} className="relative flex flex-col items-center">
                {/* Connector line between repayments */}
                {index < repayments.length - 1 && (
                  <div className="absolute left-1/2 -translate-x-1/2 top-38 h-[33%] flex flex-col items-center justify-between z-10">
                    <div className="w-2 h-2 bg-[#858699] rounded-full"></div>
                    <div className="w-px flex-1 border-l-2 border-dashed border-[#858699] z-0"></div>
                    <div className="w-2 h-2 bg-[#858699] rounded-full"></div>
                  </div>
                )}

                {/* Date / Status Badge */}
                <div className="relative right-40">
                  <span
                    className={`inline-block px-3 py-1 text-xs font-bold text-white rounded-t-md ${badgeColor}`}
                  >
                    {badgeText}
                  </span>
                </div>

                {/* Card */}
                <div
                  className={`relative z-10 w-full max-w-md border ${borderColor} rounded-xl p-4 hover:shadow-md transition-shadow mb-10 flex flex-col gap-3`}
                >
                  <div className="flex items-center justify-between mb-4 mt-3">
                    <span className="text-sm font-bold text-gray-900">
                      {item.bankName}
                    </span>

                    {isPaid ?(<p className="font-semibold">Paid on: {format(parseISO(item.paidDate),"dd-MM-yyyy")}</p>): (
                      <button
                        onClick={() => handleRepayNow(item.id)}
                        className={`flex items-center text-sm font-bold transition-colors ${
                          canRepay
                            ? "text-gray-900 hover:text-gray-700"
                            : "text-gray-400 cursor-not-allowed"
                        }`}
                        disabled={!canRepay || repay}
                      >
                        Repay Now
                        <ChevronRight className="w-4 h-4 ml-0.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-start justify-between bg-[#FAFAFA] -m-4 px-4 py-1 rounded-b-xl">
                    <div>
                      <div className="text-2xl font-semibold text-gray-900 mb-1">
                        {formatCurrency(item.totalAmount)}
                      </div>
                      <div className="text-[10px] text-gray-500 uppercase tracking-wide">
                        Total Amount
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-2xl font-semibold text-gray-900 mb-1">
                        {item.interest}%
                      </div>
                      <div className="text-[10px] text-gray-500 uppercase tracking-wide">
                        Interest
                      </div>
                    </div>

                    <div className="text-right">
                      <div
                        className={`text-2xl font-semibold mb-1 text-[#2A9266]`}
                      >
                        {formatCurrency(totalRepaid)}
                      </div>
                      <div className="text-[10px] text-gray-400 uppercase tracking-wide">
                        REPAID
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BorrowerRepayments;
