import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "../ui/input";
import { useEffect, useState } from "react";
import { parseISO, format } from "date-fns";
import { toast } from "sonner";
import axios from "axios";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";

// =====================
// Types
// =====================
type LoanStatus = "approved" | "pending" | "rejected";

interface Loan {
  ID: number;
  fullName: string;
  amount: number;
  LoanStatus: LoanStatus;
  AppliedDate: string;
  ActionDate: string;
  loanActive?: boolean;
  loanPaid?:boolean;
  rejectionReason?: string;
  loanCode:string;
}

// =====================
// Component
// =====================
export default function AdminLoanRequests() {
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(
    null
  );
  const [selectedLoanId, setSelectedLoanId] = useState<number | null>(null);
  const [reason, setReason] = useState("");
  const [loans, setLoans] = useState<Loan[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch All Loans
  const fetchLoanRequests = async () => {
    try {
      const response = await axios.get<{ loans: Loan[] }>(
        `${import.meta.env.VITE_GO_URI}admin/loans`,
        {
          headers: { "x-api-key": import.meta.env.VITE_ADMIN_SECRET_KEY },
        }
      );
      setLoans(response.data?.loans || []);
      console.log(response)
    } catch (error) {
      console.error("Error fetching loans:", error);
      toast.error("Failed to fetch loan data");
    }
  };

  // Confirm Action (Approve / Reject)
  const handleConfirm = async () => {
    if (!selectedLoanId) return;

    try {
      if (actionType === "approve") {
        await axios.patch(
          `${import.meta.env.VITE_GO_URI}admin/loans/${selectedLoanId}`,
          { loanStatus: "approved" },
          { headers: { "x-api-key": import.meta.env.VITE_ADMIN_SECRET_KEY } }
        );
        toast.success("Loan Approved Successfully");
      } else if (actionType === "reject") {
        if (!reason.trim()) {
          toast.warning("Reason can't be empty");
          return;
        }
        await axios.patch(
          `${import.meta.env.VITE_GO_URI}admin/loans/${selectedLoanId}`,
          { loanStatus: "rejected", rejectionReason: reason },
          { headers: { "x-api-key": import.meta.env.VITE_ADMIN_SECRET_KEY } }
        );
        toast.success("Loan Rejected Successfully");
      }

      setReason("");
      setActionType(null);
      setSelectedLoanId(null);
      fetchLoanRequests();
    } catch (error) {
      console.error("Error updating loan status:", error);
      toast.error("Failed to update loan status");
    }
  };

  useEffect(() => {
    fetchLoanRequests();
  }, []);

  // Search & Filter
  const filteredLoans = loans.filter((loan) => {
    const search = searchTerm.toLowerCase();
    return (
      loan.fullName?.toLowerCase().includes(search) ||
      loan.amount.toString().includes(search) ||
      loan.LoanStatus.toLowerCase().includes(search) ||
      loan.loanCode.toLowerCase().includes(search)||
      (loan.rejectionReason?.toLowerCase().includes(search) ?? false)
    );
  });

  const pendingLoans = filteredLoans.filter(
    (loan) => loan.LoanStatus === "pending"
  );
  const approvedLoans = filteredLoans.filter(
    (loan) => loan.LoanStatus === "approved"
  );
  const rejectedLoans = filteredLoans.filter(
    (loan) => loan.LoanStatus === "rejected"
  );

  // =====================
  // UI
  // =====================
  return (
    <div className="p-4 font-robbert">
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
        {[
          {
            title: "Total Active Loans",
            value: approvedLoans.filter((loan) => loan.loanActive).length,
          },
          { title: "Pending Applications", value: pendingLoans.length },
          { title: "Rejected Loans", value: rejectedLoans.length },
          { title: "Paid Loans", value: approvedLoans.filter((loan) => loan.loanPaid).length },
        ].map((item) => (
          <Card
            key={item.title}
            className="cursor-pointer hover:shadow-md transition bg-[#F4F9FF] border rounded-xl p-2"
          >
            <CardContent className="flex justify-between gap-6 p-2">
              <p className="font-medium mb-1 text-lg">{item.title}</p>
                <h3 className="text-2xl font-bold text-[#001336]">
                  {item.value}
                </h3>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Loans Section */}
      <h2 className="text-lg font-semibold mb-2">Loans</h2>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="rounded-full gap-2">
          <TabsTrigger
            value="pending"
            className="w-25 h-8 py-1.25 px-3 data-[state=active]:bg-black data-[state=active]:text-white rounded-full transition-all bg-[#F3F3F5]"
          >
            Pending ({pendingLoans.length})
          </TabsTrigger>
          <TabsTrigger
            value="approved"
            className="w-25 h-8 py-1.25 px-3 data-[state=active]:bg-black data-[state=active]:text-white rounded-full transition-all bg-[#F3F3F5]"
          >
            Approved ({approvedLoans.length})
          </TabsTrigger>
          <TabsTrigger
            value="rejected"
            className="w-25 h-8 py-1.25 px-3 data-[state=active]:bg-black data-[state=active]:text-white rounded-full transition-all bg-[#F3F3F5]"
          >
            Rejected ({rejectedLoans.length})
          </TabsTrigger>
        </TabsList>

        {/* 🔍 Search Bar */}
        <div className="mb-2 flex items-center gap-2 max-w-md bg-gray-50 border rounded-full px-4 py-2 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
          <Search className="w-4 h-4 text-gray-500" />
          <Input
            placeholder="Search by name, amount, status, or reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-none bg-transparent shadow-none focus:ring-0 focus:outline-none focus-visible:ring-0"
          />
        </div>

        {/* ---------- Pending Loans ---------- */}
        <TabsContent value="pending">
          {pendingLoans.length === 0 ? (
            <p>No Pending Loans match your search</p>
          ) : (
            <LoanTable
              loans={pendingLoans}
              type="pending"
              onApprove={(id) => {
                setActionType("approve");
                setSelectedLoanId(id);
              }}
              onReject={(id) => {
                setActionType("reject");
                setSelectedLoanId(id);
              }}
              handleConfirm={handleConfirm}
              setReason={setReason}
              reason={reason}
              actionType={actionType}
            />
          )}
        </TabsContent>

        {/* ---------- Approved Loans ---------- */}
        <TabsContent value="approved">
          {approvedLoans.length === 0 ? (
            <p>No Approved Loans match your search</p>
          ) : (
            <LoanTable loans={approvedLoans} type="approved" />
          )}
        </TabsContent>

        {/* ---------- Rejected Loans ---------- */}
        <TabsContent value="rejected">
          {rejectedLoans.length === 0 ? (
            <p>No Rejected Loans match your search</p>
          ) : (
            <LoanTable loans={rejectedLoans} type="rejected" />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// =====================
// LoanTable Subcomponent
// =====================
interface LoanTableProps {
  loans: Loan[];
  type: LoanStatus;
  onApprove?: (id: number) => void;
  onReject?: (id: number) => void;
  handleConfirm?: () => void;
  setReason?: (v: string) => void;
  reason?: string;
  actionType?: "approve" | "reject" | null;
}

function LoanTable({
  loans,
  type,
  onApprove,
  onReject,
  handleConfirm,
  setReason,
  reason,
  actionType,
}: LoanTableProps) {
  return (
    <div className="bg-white rounded-xl border h-96 overflow-y-scroll shadow-lg">
      <table className="min-w-full text-sm text-left">
        <thead className="bg-gray-50 border-b text-gray-600 ">
          <tr>
            <th className="px-6 py-3 font-medium">Borrower’s Name</th>
            <th className="px-6 py-3 font-medium">Application Date</th>
            <th className="px-6 py-3 font-medium">Amount</th>
            <th className="px-6 py-3 font-medium">Loan Code</th>
            {type !== "pending" && (
              <th className="px-6 py-3 font-medium text-right">
                {type === "approved" ? "Approval Date" : "Rejection Date"}
              </th>
            )}
            {type === "pending" && (
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            )}
          </tr>
        </thead>
        <tbody className="">
          {loans.map((loan) => (
            <tr
              key={loan.ID}
              className="border-b last:border-0 hover:bg-gray-50 transition "
            >
              <td className="px-6 py-3">
                <Link
                  to={`/admin/loans/${loan.ID}`}
                  className="text-blue-600 hover:underline font-medium"
                >
                  {loan.fullName}
                </Link>
              </td>
              <td className="px-6 py-3">
                {format(parseISO(loan.AppliedDate), "dd/MM/yyyy")}
              </td>
              <td className="px-6 py-3">{loan.amount}</td>
              <td className="px-6 py-3">{loan.loanCode}</td>

              {type === "pending" ? (
                <td className="px-6 py-3 text-right flex justify-end gap-2">
                  <AlertDialog>
                    <div className="flex gap-2">
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="bg-[#F3F3F5] rounded-full"
                          onClick={() => onApprove?.(loan.ID)}
                        >
                          Approve
                        </Button>
                      </AlertDialogTrigger>

                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="bg-[#F3F3F5] rounded-full"
                          onClick={() => onReject?.(loan.ID)}
                        >
                          Reject
                        </Button>
                      </AlertDialogTrigger>
                    </div>

                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-lg">
                          {actionType === "approve"
                            ? "Are you sure you want to approve this loan?"
                            : "Reason for rejection"}
                        </AlertDialogTitle>
                        {actionType === "reject" && (
                          <AlertDialogDescription>
                            <Input
                              placeholder="Enter reason here"
                              value={reason}
                              onChange={(e) => setReason?.(e.target.value)}
                              maxLength={150}
                              required
                              className="text-black font-semibold"
                            />
                          </AlertDialogDescription>
                        )}
                      </AlertDialogHeader>
                      <AlertDialogFooter className="gap-5">
                        <AlertDialogCancel className="w-57 h-10 rounded-full font-bold border-black">
                          {actionType === "approve" ? "No, Go Back" : "Cancel"}
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleConfirm}
                          className="w-57 h-10 rounded-full font-bold"
                        >
                          Confirm
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </td>
              ) : (
                <td className="px-12 py-3 text-right">
                  {loan.ActionDate
                    ? format(parseISO(loan.ActionDate), "dd/MM/yyyy")
                    : "-"}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
