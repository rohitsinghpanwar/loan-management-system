// src/types/loan.ts

export interface Loan {
  ID: string;
  loanCode:string;
  amount: number;
  totalPayable?: number;
  totalPaid?: number;
  LoanStatus: "approved" | "pending" | "rejected";
  AppliedDate: string;
  ActionDate:string;
  repayTenure:number;
  loanType:string;
  interestRate:number;
  loanPaid:boolean;
  totalInterest:number;
  rejectionReason?: string;
  loanActive?: boolean;
  BankName:string;
}

export interface LoansContextType {
  totalLoans: Loan[];
  activeLoans: Loan[];
  paidLoans: Loan[];
  outstandingBalance: number;
  platformScore: number;
  totalApproved : number;
  fetchLoans: () => void;
}
