import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import arrowIcon from "../../assets/Arrow.svg";
import { Input } from "../ui/input";
import { useEffect, useState } from "react";
import { parseISO, format } from "date-fns";
import { toast } from "sonner";
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
import axios from "axios";

function AdminDashboard() {
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(
    null
  );
  const [selectedLoanId, setSelectedLoanId] = useState<number | null>(null);

  const handleConfirm = async () => {
    if (!selectedLoanId) return;
  
    try {
      if (actionType === "approve") {
        await axios.patch(
          `${import.meta.env.VITE_GO_URI}admin/loans/${selectedLoanId}`,
          { loanStatus: "approved" },
          { headers: { "x-api-key": import.meta.env.VITE_ADMIN_SECRET_KEY } }
        );
        toast.success("Loan Approved")
      } else if (actionType === "reject") {
        if(!reason){
      toast.warning("Reason can't be empty")
      return
    }
        await axios.patch(
          `${import.meta.env.VITE_GO_URI}admin/loans/${selectedLoanId}`,
          { loanStatus: "rejected", rejectionReason: reason },
          { headers: { "x-api-key": import.meta.env.VITE_ADMIN_SECRET_KEY } }
        );
        toast.success("Loan Rejected Successfully")
      }

      // Optionally refresh loans after update
      fetchLoanRequests();
    } catch (error) {
      console.error("Error updating loan status", error);
    }
  };

  const [loans, setLoans] = useState([]);
  const [reason, setReason] = useState("");
  const pendingLoans = loans.filter((loan) => loan?.LoanStatus === "pending");
  const approvedLoans = loans.filter((loan) => loan?.LoanStatus === "approved");
  const rejectedLoans = loans.filter((loan) => loan?.LoanStatus === "rejected");
  console.log(pendingLoans, approvedLoans, rejectedLoans);
  const fetchLoanRequests = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_GO_URI}admin/loans`,
        { headers: { "x-api-key": `${import.meta.env.VITE_ADMIN_SECRET_KEY}` } }
      );
      setLoans(response.data?.loans || []);
      console.log(response);
    } catch (error) {
      console.log("Error in fetching all loans", error);
    }
  };
  useEffect(() => {
    fetchLoanRequests();
  }, []);
  return (
    <div>
      {/* STATS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {[
          {
            title: "Total Active Loans",
            value: approvedLoans.filter((loan) => loan?.loanActive).length,
          },
          { title: "Pending Applications", value: pendingLoans.length },
          { title: "Overdue Loans", value: "0" },
        ].map((item) => (
          <Card
            key={item.title}
            className="cursor-pointer hover:shadow-md transition bg-[#F4F9FF] border rounded-xl "
          >
            <CardContent className=" flex flex-col gap-6">
               <p className="font-medium mb-1 text-lg">
                  {item.title}
                </p>
              <div className="flex w-full items-center justify-between">
               <h3 className="text-2xl font-bold text-[#001336]">{item.value}</h3>
               <img src={arrowIcon} alt="" className="w-6 h-6" />
              </div>
              
            </CardContent>
          </Card>
        ))}
      </div>
      {/* LOANS SECTION */}
      <h2 className="text-lg font-semibold mb-3">Loans</h2>
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="rounded-full mb-6 gap-2">
          <TabsTrigger value="pending" className="w-25 h-8 py-1.25 px-3 data-[state=active]:bg-black data-[state=active]:text-white rounded-full transition-all ease-in-out duration-300 bg-[#F3F3F5]">Pending {`(${pendingLoans.length})`}</TabsTrigger>
          <TabsTrigger value="approved" className="w-25 h-8 py-1.25 px-3 data-[state=active]:bg-black data-[state=active]:text-white rounded-full transition-all ease-in-out duration-300 bg-[#F3F3F5]">Approved {`(${approvedLoans.length})`}</TabsTrigger>
          <TabsTrigger value="rejected" className="w-25 h-8 py-1.25 px-3 data-[state=active]:bg-black data-[state=active]:text-white rounded-full transition-all ease-in-out duration-300 bg-[#F3F3F5]">Rejected {`(${rejectedLoans.length})`}</TabsTrigger>
        </TabsList>

        {/* Pending Loans */}
        <TabsContent value="pending">
          {pendingLoans.length === 0 ? (
            "No Pending Loans yet"
          ) : (
            <div className="bg-white border rounded-xl overflow-x-auto">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-gray-50 border-b text-gray-600">
                  <tr>
                    <th className="px-6 py-3 font-medium">Borrower’s Name</th>
                    <th className="px-6 py-3 font-medium">Application Date</th>
                    <th className="px-6 py-3 font-medium">Amount</th>
                    <th className="px-6 py-3 font-medium text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pendingLoans.map((loan, index) => (
                    <tr
                      key={index}
                      className="border-b last:border-0 hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-3">{loan.fullName}</td>
                      <td className="px-6 py-3">
                        {" "}
                        {format(
                          parseISO(loan.AppliedDate),
                          "dd/MM/yyyy"
                        )}
                      </td>
                      <td className="px-6 py-3">{loan.amount}</td>
                      <td className="px-6 py-3 text-right flex justify-end gap-2">
                        <AlertDialog>
                          <div className="flex gap-2">
                            {/* APPROVE Button */}
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                className="bg-[#F3F3F5] rounded-full"
                                onClick={() => {
                                  setActionType("approve");
                                  setSelectedLoanId(loan.ID);
                                }}
                              >
                                Approve
                              </Button>
                            </AlertDialogTrigger>

                            {/* REJECT Button */}
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                className="bg-[#F3F3F5] rounded-full"
                                onClick={() => {
                                  setActionType("reject");
                                  setSelectedLoanId(loan.ID);
                                }}
                              >
                                Reject
                              </Button>
                            </AlertDialogTrigger>
                          </div>

                          {/* Shared AlertDialogContent */}
                          <AlertDialogContent className="">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-lg">
                                {actionType === "approve"
                                  ? "Are you sure you want to approve this application?"
                                  : "Reason for rejection"}
                              </AlertDialogTitle>
                              {actionType === "reject" && (
                                <AlertDialogDescription>
                                  <Input
                                    placeholder="Enter reason here"
                                    onChange={(e) => setReason(e.target.value)}
                                    required
                                    className="text-black font-semibold"
                                  ></Input>
                                </AlertDialogDescription>
                              )}
                            </AlertDialogHeader>

                            <AlertDialogFooter className="gap-5">
                              <AlertDialogCancel className=" w-57 h-10 rounded-full font-bold border-black">
                                {actionType === "approve"
                                  ? "No, Go Back"
                                  : "Cancel"}
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleConfirm}
                                className={`w-57 h-10 rounded-full font-bold`}
                              >
                                {actionType === "approve"
                                  ? "Yes, Confirm"
                                  : "Confirm"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        {/* Approved Loans */}
        <TabsContent value="approved">
          {approvedLoans.length === 0 ? (
            "No Approved Loans yet"
          ) : (
            <div className="bg-white border rounded-xl overflow-x-auto">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-gray-50 border-b text-gray-600">
                  <tr>
                    <th className="px-6 py-3 font-medium">Borrower’s Name</th>
                    <th className="px-6 py-3 font-medium">Application Date</th>
                    <th className="px-6 py-3 font-medium">Amount</th>
                    <th className="px-6 py-3 font-medium text-right">
                      Approval Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {approvedLoans.map((loan, index) => (
                    <tr
                      key={index}
                      className="border-b last:border-0 hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-3">{loan.fullName}</td>
                      <td className="px-6 py-3">
                        {" "}
                        {format(
                          parseISO(loan.AppliedDate),
                          "dd/MM/yyyy"
                        )}
                      </td>
                      <td className="px-6 py-3">{loan.amount}</td>
                      <td className="px-12 py-3 text-right">
                        {format(parseISO(loan.ActionDate), "dd/MM/yyyy")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        {/* Rejected Loans */}
        <TabsContent value="rejected">
          {rejectedLoans.length === 0 ? (
            "No Rejected loans yet"
          ) : (
            <div className="bg-white border rounded-xl overflow-x-auto">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-gray-50 border-b text-gray-600">
                  <tr>
                    <th className="px-6 py-3 font-medium">Borrower’s Name</th>
                    <th className="px-6 py-3 font-medium">Application Date</th>
                    <th className="px-6 py-3 font-medium">Amount</th>
                    <th className="px-6 py-3 font-medium text-right">
                      Rejection Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rejectedLoans.map((loan, index) => (
                    <tr
                      key={index}
                      className="border-b last:border-0 hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-3">{loan.fullName}</td>
                      <td className="px-6 py-3">
                        {" "}
                        {format(
                          parseISO(loan.AppliedDate),
                          "dd/MM/yyyy"
                        )}
                      </td>
                      <td className="px-6 py-3">{loan.amount}</td>
                      <td className="px-12 py-3 text-right">  {format(
                          parseISO(loan.ActionDate),
                          "dd/MM/yyyy"
                        )}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AdminDashboard;
