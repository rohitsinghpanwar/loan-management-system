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

function BorrowerMain() {
  const { logout } = useAuth();
  return (
    <div className="flex">
      <div className="flex flex-col w-56 max-w-80 min-h-screen bg-[#001336] text-white py-10 px-4 gap-4 font-head">
        {/* Dashboard */}
        <NavLink
          to="/borrower/dashboard"
          className={({ isActive }) =>
            `p-4  rounded-full flex flex-col items-center justify-center font-semibold transition-all duration-200 w-30 h-13 ${
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
          to="/borrower/apply-loan"
          className={({ isActive }) =>
            `flex flex-col items-start justify-center p-4 rounded-full text-center font-semibold transition-all duration-200 w-30 h-13 ${
              isActive
                ? "bg-white text-blue-950 shadow-sm"
                : "hover:bg-blue-900 hover:text-white"
            }`
          }
        >
          Apply Loan
        </NavLink>

        {/* Settings */}
        <NavLink
          to="#"
          className="flex flex-col items-start justify-center p-4 rounded-full text-center font-semibold transition-all duration-200 w-30 h-13"
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
      <Outlet />
    </div>
  );
}

export default BorrowerMain;
