import { NavLink, Outlet } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "./AuthContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

function AdminMain() {
  const { logout } = useAuth();
  return (
    <div className="flex">
      <div className="flex flex-col w-56 max-w-80 min-h-screen bg-[#001336] text-white py-10 px-4 gap-4 font-head">
        {/* Dashboard */}
        <NavLink
          to="/admin/dashboard"
          className={({ isActive }) =>
            `p-4  rounded-full flex flex-col items-start justify-center font-semibold transition-all duration-200 w-34 h-13 ${
              isActive
                ? "bg-white text-blue-950 shadow-sm"
                : "hover:bg-blue-900 hover:text-white"
            }`
          }
        >
          Dashboard
        </NavLink>

        {/* Loans */}
        <NavLink
          to="/admin/kyc-requests"
          className={({ isActive }) =>
            `flex flex-col items-start justify-center p-4 rounded-full text-center font-semibold transition-all duration-200 w-34 h-13 ${
              isActive
                ? "bg-white text-blue-950 shadow-sm"
                : "hover:bg-blue-900 hover:text-white"
            }`
          }
        >
          KYC Requests
        </NavLink>

        {/* Settings */}
        <NavLink
          to="#"
          className="flex flex-col items-start justify-center p-4 rounded-full text-center font-semibold transition-all duration-200 w-34 h-13"
        >
          Settings
        </NavLink>
        <AlertDialog>
          <div className="flex flex-1 items-end justify-start px-2 ">
            <AlertDialogTrigger asChild>
              <div className="flex  cursor-pointer gap-2">
                <LogOut />
                <h1 className="font-bold">Log-out</h1>
              </div>
            </AlertDialogTrigger>
          </div>

          <AlertDialogContent className="font-head">
            <AlertDialogHeader>
              <AlertDialogTitle>
                Are You Sure You want to Log-Out ?
              </AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="w-57 h-10 rounded-full font-bold border-black">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                className="w-57 h-10 rounded-full font-bold"
                onClick={() => logout()}
              >
                Yes, Log out
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <div className="w-full min-h-screen bg-[#F8F9FA] px-10 py-8 font-head">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold">Hi Admin</h1>
            <p className="text-muted-foreground text-xl">
              Manage loans and Approvals.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-gray-100 h-12 rounded-full p-2">
            <div className="w-10 h-10 p-2 rounded-full bg-black text-white flex items-center justify-center text-md font-bold">
              AD
            </div>
            <span className="font-normal text-lg">Admin</span>
          </div>
        </div>
        <Outlet />
      </div>
    </div>
  );
}

export default AdminMain;
