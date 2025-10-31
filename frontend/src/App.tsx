import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import Login from "./components/pages/Login";
import Signup from "./components/pages/Signup";
import Profile from "./components/pages/Profile";
import KycUpload from "./components/pages/KycUpload";
import KycReview from "./components/pages/KycReview";
import BorrowerDashboard from "./components/pages/BorrowerDashboard";
import BorrowerApplyLoan from "./components/pages/BorrowerApplyLoan";
import BorrowerLoans from "./components/pages/BorrowerLoans";
import BorrowerMain from "./components/pages/BorrowerMain";
import AdminMain from "./components/pages/AdminMain";
import AdminLoanRequests from "./components/pages/AdminLoanRequests";
import AdminKycRequests from "./components/pages/AdminKycRequests";
import NotFound from "./components/pages/NotFound";
import BorrowerEligibility from "./components/pages/BorrowerEligibility";
import RouteProtector from "./components/pages/RouteProtector";
import BorrowerUpcomingRepayments from "./components/pages/BorrowerUpcomingRepayments";
import BorrowerProfile from "./components/pages/BorrowerProfile";
import AdminLoanDetails from "./components/pages/AdminLoanDetails";
import AdminLoansStats from "./components/pages/AdminLoansAnalytics";
function App() {
  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Root route — redirects inside RouteProtector */}
        <Route
          path="/"
          element={
            <RouteProtector allowedRoles={["borrower", "admin"]}>
              <div /> {/* RouteProtector will handle redirect */}
            </RouteProtector>
          }
        />

        {/* Borrower routes */}
        <Route
          path="/profile"
          element={
            <RouteProtector allowedRoles={["borrower"]} requiredStage="profile_pending">
              <Profile />
            </RouteProtector>
          }
        />

        <Route
          path="/kyc"
          element={
            <RouteProtector allowedRoles={["borrower"]} requiredStage="kyc_pending">
              <KycUpload />
            </RouteProtector>
          }
        />

        <Route
          path="/kyc-review"
          element={
            <RouteProtector allowedRoles={["borrower"]} requiredStage="kyc_pending">
              <KycReview />
            </RouteProtector>
          }
        />

        <Route
          path="/borrower"
          element={
            <RouteProtector allowedRoles={["borrower"]} requiredStage="completed">
              <BorrowerMain />
            </RouteProtector>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<BorrowerDashboard />} />
          <Route path="apply-loan" element={<BorrowerApplyLoan />} />
          <Route path="eligible" element={<BorrowerEligibility />} />
          <Route path="repayments" element={<BorrowerUpcomingRepayments />} />
          <Route path="loans" element={<BorrowerLoans showAll={true}/>}/>
          <Route path="profile" element={<BorrowerProfile/>}/>
        </Route>

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <RouteProtector allowedRoles={["admin"]}>
              <AdminMain />
            </RouteProtector>
          }
        >
          <Route index element={<Navigate to="loans" replace />} />
          <Route path="loans" element={<AdminLoanRequests />} />
          <Route path="kyc-requests" element={<AdminKycRequests />} />
          <Route path="analytics" element={<AdminLoansStats />} />
          <Route path="/admin/loans/:id" element={<AdminLoanDetails />} />


        </Route>

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      <Toaster richColors position="top-right" theme="dark" />
    </>
  );
}

export default App;
