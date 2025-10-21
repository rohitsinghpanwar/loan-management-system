import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "./AuthContext";

interface User {
  _id: string;
  fullName: string;
  signupStage: "profile_pending" | "kyc_pending" | "completed";
  kyc_status: "pending" | "under_review" | "approved" | "rejected";
  rejectionReason?: string;
  role: "borrower" | "admin";
}

interface RouteProtectorProps {
  children: React.ReactNode;
  allowedRoles: User["role"][];
  requiredStage?: "profile_pending" | "kyc_pending" | "completed";
}

export default function RouteProtector({
  children,
  allowedRoles,
  requiredStage,
}: RouteProtectorProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const { user, userInfo } = useAuth();
  const navigatedRef = useRef(false); // ✅ prevents repeated redirects

  useEffect(() => {
    const verify = async () => {
      try {
        if (navigatedRef.current) return; // stop multiple redirects

        let currentUser: User | null = user || null;

        // 🔹 Fetch from API if not available in context
        if (!currentUser) {
          const { data } = await axios.get(
            `${import.meta.env.VITE_NODE_URI}api/v1/borrower/me`,
            { withCredentials: true }
          );
          currentUser = data;
          console.log("the current user is"+currentUser)

          if (currentUser) userInfo(currentUser);
        }

        // 🔹 If still no user, go to login
        if (!currentUser) {
          navigate("/login", { replace: true });
          return;
        }

        // 🔹 Role check
        if (!allowedRoles.includes(currentUser.role)) {
          navigate("/login", { replace: true });
          return;
        }

        let targetPath = "";

        // 🔹 Admin route logic
        if (currentUser.role === "admin") {
          if (window.location.pathname === "/" || !window.location.pathname.startsWith("/admin")) {
            targetPath = "/admin/dashboard";
          }
        }

        // 🔹 Borrower route logic
        if (currentUser.role === "borrower") {
          if (window.location.pathname === "/") {
            switch (currentUser.signupStage) {
              case "profile_pending":
                targetPath = "/profile";
                break;
              case "kyc_pending":
                if (currentUser.kyc_status === "pending") {
                  targetPath = "/kyc";
                } else if (
                  currentUser.kyc_status === "under_review" ||
                  currentUser.kyc_status === "rejected"
                ) {
                  targetPath = "/kyc-review";
                }
                break;
              case "completed":
                targetPath = "/borrower/dashboard";
                break;
              default:
                targetPath = "/signup";
                break;
            }
          } else {
            // Check if user is trying to access wrong page based on stage
            switch (currentUser.signupStage) {
              case "profile_pending":
                if (requiredStage !== "profile_pending") targetPath = "/profile";
                break;
              case "kyc_pending":
                if (currentUser.kyc_status === "pending" && requiredStage !== "kyc_pending") {
                  targetPath = "/kyc";
                } else if (
                  (currentUser.kyc_status === "under_review" ||
                    currentUser.kyc_status === "rejected") &&
                  window.location.pathname !== "/kyc-review"
                ) {
                  targetPath = "/kyc-review";
                }
                break;
              case "completed":
                if (requiredStage && requiredStage !== "completed") {
                  targetPath = "/borrower/dashboard";
                }
                break;
              default:
                targetPath = "/signup";
                break;
            }
          }
        }

        // 🔹 Perform navigation if needed
        if (targetPath && window.location.pathname !== targetPath) {
          navigatedRef.current = true;
          navigate(targetPath, { replace: true });
          return;
        }
      } catch (err) {
        console.error("RouteProtector Error:", err);
        navigate("/login", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [allowedRoles, requiredStage, navigate, user, userInfo]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg font-semibold">
        Loading...
      </div>
    );
  }

  return <>{children}</>;
}
