import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { ArrowRight } from "lucide-react";
import cardIcon from "../../assets/Card.svg";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { useEffect, useState } from "react";
import axios from "axios";
import Repayments from "./BorrowerRepayments";
import nothingIcon from "../../assets/empty.png";
import { ChevronRight } from "lucide-react";
import { parseISO,format } from "date-fns";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

function BorrowerDashboard() {
  const [selectedLoanId, setSelectedLoanId] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();
  const fullName = user?.fullName || "User";
  const nameParts = fullName.trim().split(" ");
  const initials =
    nameParts.length === 1
      ? nameParts[0][0]
      : `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`;
  const [totalLoans, setTotalLoans] = useState([]);
  console.log(selectedLoanId);
  const pendingLoans = totalLoans.filter(
    (loan) => loan?.LoanStatus === "pending"
  );
  const approvedLoans = totalLoans.filter(
    (loan) => loan?.LoanStatus === "approved"
  );
  const rejectedLoans = totalLoans.filter(
    (loan) => loan?.LoanStatus === "rejected"
  );
  console.log(pendingLoans)
  const formatCurrency = (amount: number) =>
    amount.toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits:0,
    });
  const userAllLoans = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_GO_URI}loans/get/${user?._id}`,
        {
          headers: {
            "x-api-key": `${import.meta.env.VITE_BORROWER_SECRET_KEY}`,
          },
        }
      );
      setTotalLoans(response.data?.loans);
    } catch (error) {
      console.log("Error in fetching all loans", error);
    }
  };
  useEffect(() => {
    userAllLoans();
  }, []);
  return (
    <div className="w-full min-h-screen bg-[#F8F9FA] px-10 py-2  font-head ">
      {/* HEADER */}
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

      {/* TOP SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Left Card: Total Loan Approved */}
        <Card className=" flex flex-col items-center justify-center col-span-2 bg-gradient-to-br from-yellow-200 to-zinc-200  border-none h-46 ">
          <CardContent className="flex flex-col items-center justify-center w-82 h-28 g-3">
            <div className="flex flex-col items-center justify-center">
              <p className="text-sm text-muted-foreground">
                Total Loan Approved
              </p>
              <h2 className="text-3xl font-extrabold mt-1 text-muted-foreground">
                {formatCurrency(approvedLoans.reduce((sum,loan)=>sum+loan.amount,0))}
              </h2>
            </div>
            <Button className="mt-4 w-82 h-13 rounded-full text-white bg-black" onClick={()=>navigate("/borrower/apply-loan")}>
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
              onClick={() => navigate("/borrower/dashboard")}
            >
              <div className="w-16 h-16 flex items-center justify-center bg-white rounded-full">
                <Plus className="w-6 h-6 " />
              </div>
              <p className="text-xs font-medium">My Loans</p>
            </div>
            <div
              className="flex flex-col w-30 h-22 gap-3 items-center"
              onClick={() => navigate("/borrower/apply-loan")}
            >
              <div className="w-16 h-16 flex items-center justify-center bg-white rounded-full">
                <Plus className="w-6 h-6 " />
              </div>
              <p className="text-xs font-medium">Apply for a new loan</p>
            </div>
            <div className="flex flex-col w-28 h-22 gap-3 items-center">
              <div className="w-16 h-16 flex items-center justify-center bg-white rounded-full">
                <Plus className="w-6 h-6 " />
              </div>
              <p className="text-xs font-medium">Repayments</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* STATS ROW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { title: "Active Loans", value: `${approvedLoans.filter(loan=>loan.loanActive).length}`},
          { title: "Credit Score", value: "750" },
        ].map((item) => (
          <Card
            key={item.title}
            className="p-2.5 cursor-pointer hover:shadow-md transition bg-[#F4F9FF] w-58 h-28 gap-2.5 rounded-lg flex justify-center"
          >
            <CardContent className="">
              <p className="text-sm font-medium mb-1">{item.title}</p>
              <div className="flex justify-between">
                <h3 className="text-2xl font-extrabold">{item.value}</h3>
                <ArrowRight />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* MY LOANS SECTION */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold">My Loans</h2>
       <div className="flex text-xl font-bold gap-2 items-center justify-center">
        View 
        <ChevronRight/>
       </div>
      </div>

      <Tabs defaultValue="approved" className="w-full">
        <TabsList className="rounded-full gap-2">
          <TabsTrigger
            value="approved"
            className="w-30 h-8 py-1.25 data-[state=active]:bg-black data-[state=active]:text-white rounded-full transition-all ease-in-out duration-300 bg-[#F3F3F5]"
          >
            Approved {`(${approvedLoans.length})`}
          </TabsTrigger>
          <TabsTrigger
            value="pending"
            className="w-30 h-8 py-1.25 data-[state=active]:bg-black data-[state=active]:text-white rounded-full transition-all ease-in-out duration-300 bg-[#F3F3F5]"
          >
            Pending {`(${pendingLoans.length})`}
          </TabsTrigger>
          <TabsTrigger
            value="rejected"
            className="w-30 h-8 py-1.25 data-[state=active]:bg-black data-[state=active]:text-white rounded-full transition-all ease-in-out duration-300 bg-[#F3F3F5]"
          >
            Rejected {`(${rejectedLoans.length})`}
          </TabsTrigger>
        </TabsList>

        {/* Approved Loans */}
        <TabsContent value="approved" className="flex gap-5 max-w-6xl flex-wrap">
          <Sheet>
            {approvedLoans.length === 0 ? (
              <div className="w-full items-center flex flex-col justify-center rounded-lg bg-[#1E83FF]/5 h-35">
                <img src={nothingIcon} alt="" className="w-20 h-20" />
                <h1 className="font-bold text-lg">No Approved Loans Yet</h1>
              </div>
            ) : (
              <SheetTrigger className="w-full flex gap-5 ">
                {approvedLoans.map((value, key) => (
                  <Card
                    key={key}
                    className="hover:shadow-md transition rounded-xl w-90 p-0"
                    onClick={() => setSelectedLoanId(value.ID)}
                  >
                    <CardContent className="flex items-center justify-between  m-2 px-2">
                      <div className="flex flex-col items-start">
                        <p className="text-sm text-gray-500 font-normal">
                          Loan Amount
                        </p>
                        <h3 className="text-xl font-bold">
                          {formatCurrency(value.amount)}
                        </h3>
                      </div>
                      <img
                        src={cardIcon}
                        alt="cardIcon"
                        className="w-12 h-12"
                      />
                    </CardContent>
                    <CardFooter className="bg-[#1E83FF]/5 border-black flex justify-between h-10 p-4">
                      <p className="font-normal text-[#1E83FF]">Issued by </p>
                      <p className="font-semibold">IDFC First Bank</p>
                    </CardFooter>
                  </Card>
                ))}
              </SheetTrigger>
            )}

            <SheetContent className="min-w-lg">
              <SheetHeader>
                <SheetTitle className="font-medium text-2xl text-gray-900">
                  Repayment Schedule
                </SheetTitle>
              </SheetHeader>
              <Repayments loanId={selectedLoanId} />
            </SheetContent>
          </Sheet>
        </TabsContent>

        {/* Pending Loans */}
        <TabsContent value="pending" className="flex gap-5 max-w-6xl flex-wrap ">
          {pendingLoans.length === 0 ? (
            <div className="w-full items-center flex flex-col justify-center rounded-lg bg-[#1E83FF]/5 h-35">
              <img src={nothingIcon} alt="" className="w-20 h-20" />
              <h1 className="font-bold text-lg">No Pending Loans Yet</h1>
            </div>
          ) : (
            pendingLoans.map((value, key) => (
              <Card
                key={key}
                className="hover:shadow-md transition rounded-xl w-90 p-0"
                onClick={() => setSelectedLoanId(value.ID)}
              >
                <CardContent className="flex items-center justify-between  m-2 px-2">
                  <div className="flex flex-col items-start">
                    <p className="text-sm text-gray-500 font-normal">
                      Loan Amount
                    </p>
                    <h3 className="text-xl font-bold">
                      {formatCurrency(value.amount)}
                    </h3>
                  </div>
                  <img src={cardIcon} alt="cardIcon" className="w-12 h-12" />
                </CardContent>
                <CardFooter className="bg-[#1E83FF]/5 border-black flex justify-between h-10 p-4">
                  <p className="font-normal text-[#1E83FF]">Applied on </p>
                  <p className="font-semibold">{format(parseISO(value.AppliedDate),"dd-MM-yyyy")}</p>
                </CardFooter>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Rejected Loans */}
        <TabsContent value="rejected" className="flex gap-5 max-w-6xl flex-wrap">
          {rejectedLoans.length === 0 ? (
            <div className="w-full items-center flex flex-col justify-center rounded-lg bg-[#1E83FF]/5 h-35">
              <img src={nothingIcon} alt="" className="w-20 h-20 " />
              <h1 className="font-bold text-lg">No Rejected Loans Yet</h1>
            </div>
          ) : (
            rejectedLoans.map((value, key) => (
              <Card
                key={key}
                className="hover:shadow-md transition rounded-xl w-90 p-0 gap-0"
                onClick={() => setSelectedLoanId(value.ID)}
              >
                <CardContent className="flex items-center justify-between  m-2 px-2">
                  <div className="flex flex-col items-start">
                    <p className="text-sm text-gray-500 font-normal">
                      Loan Amount
                    </p>
                    <h3 className="text-xl font-bold">
                      {formatCurrency(value.amount)}
                    </h3>
                  </div>
                  <img src={cardIcon} alt="cardIcon" className="w-12 h-12" />
                </CardContent>
                <CardFooter className="bg-[#1E83FF]/5 border-black flex justify-between h-14 p-4">
                  <p className="font-semibold ">Reason - {value?.rejectionReason}</p>
                </CardFooter>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default BorrowerDashboard
