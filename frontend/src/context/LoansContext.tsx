// src/context/LoansContext.tsx
import { createContext, useContext, useState,useEffect } from "react";
import { type Loan, type LoansContextType } from "../types/loan";
import axios from "axios";
import { useAuth } from "./AuthContext";

const LoansContext = createContext<LoansContextType | undefined>(undefined);

export const LoansProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [totalLoans, setTotalLoans] = useState<Loan[]>([]);
  const [activeLoans, setActiveLoans] = useState<Loan[]>([]);
  const [paidLoans, setPaidLoans] = useState<Loan[]>([]);
  const [totalApproved,setTotalApproved]=useState(0)
  const [outstandingBalance, setOutstandingBalance] = useState(0);
  const [platformScore, setPlatformScore] = useState(0);


  const fetchLoans = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_GO_URI}loans/get/${user?._id}`, {
        headers: { "x-api-key": import.meta.env.VITE_BORROWER_SECRET_KEY },
      });

      const loansData: Loan[] = res?.data?.loans??[];
      console.log(res)

      setTotalLoans(loansData);

      // Derived metrics
      setActiveLoans(loansData.filter(l => l.loanActive));
      setPaidLoans(loansData.filter(l => l.loanPaid));
      setOutstandingBalance(
        loansData.filter(l => l.loanActive).reduce((sum, l) => sum + (l.totalPayable || l.amount), 0)
      );

      const totalApproved = loansData.filter(l => l.LoanStatus === "approved").reduce((sum, l) => sum + l.amount, 0);
      setTotalApproved(totalApproved)
      const totalPaid = loansData.filter(l => l.LoanStatus === "approved").reduce((sum, l) => sum + (l.totalPaid || 0), 0);
      const score = totalApproved ? (totalPaid / totalApproved) * 100 : 0;
      setPlatformScore(Math.round(score));
    } catch (err) {
      console.error("Error fetching loans:", err);
    }
  };
   useEffect(() => {
    fetchLoans();
  }, [user?._id]);

  return (
    <LoansContext.Provider value={{ totalLoans, activeLoans, paidLoans, outstandingBalance, platformScore,totalApproved, fetchLoans }}>
      {children}
    </LoansContext.Provider>
  );
};

export const useLoans = () => {
  const context = useContext(LoansContext);
  if (!context) throw new Error("useLoans must be used within LoansProvider");
  return context;
};
