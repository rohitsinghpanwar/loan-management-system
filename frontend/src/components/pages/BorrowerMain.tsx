import { NavLink, Outlet } from "react-router-dom";
import { LogOut, ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";
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
  const { user, logout } = useAuth();
  const fullName = user?.fullName || "User";
  const nameParts = fullName.trim().split(" ");
  const initials =
    nameParts.length === 1
      ? nameParts[0][0]
      : `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`;
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="flex flex-col w-56 bg-[#001336] text-white py-10 px-5 gap-4 font-robbert overflow-y-auto">
        <NavLink
          to="/borrower/dashboard"
          className={({ isActive }) =>
            `p-4 rounded-full flex flex-col items-start justify-center font-semibold transition-all duration-200 ${
              isActive
                ? "bg-white text-blue-950 shadow-sm"
                : "hover:bg-blue-900 hover:text-white"
            }`
          }
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/borrower/apply-loan"
          className={({ isActive }) =>
            `p-4 rounded-full flex flex-col items-start justify-center font-semibold transition-all duration-200 ${
              isActive
                ? "bg-white text-blue-950 shadow-sm"
                : "hover:bg-blue-900 hover:text-white"
            }`
          }
        >
          Apply for a Loan
        </NavLink>

        {/* Settings Dropdown */}
        <div className="flex flex-col">
          <button
            onClick={() => setSettingsOpen(!settingsOpen)}
            className="flex items-center justify-between p-4 rounded-full font-semibold transition-all duration-200 hover:bg-blue-900"
          >
            <span>Settings</span>
            {settingsOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          {settingsOpen && (
            <div className="ml-4 mt-2 flex flex-col gap-2 transition-all duration-200">
              <NavLink
                to="/borrower/profile"
                className={({ isActive }) =>
                  `p-3 rounded-full text-sm transition-all duration-200 ${
                    isActive
                      ? "bg-white text-blue-950 shadow-sm"
                      : "hover:bg-blue-800 hover:text-white"
                  }`
                }
              >
                Profile
              </NavLink>
              <NavLink
                to="/borrower/loans"
                className={({ isActive }) =>
                  `p-3 rounded-full text-sm transition-all duration-200 ${
                    isActive
                      ? "bg-white text-blue-950 shadow-sm"
                      : "hover:bg-blue-800 hover:text-white"
                  }`
                }
              >
                My Loans
              </NavLink>
              <NavLink
                to="/borrower/repayments"
                className={({ isActive }) =>
                  `p-3 rounded-full text-sm transition-all duration-200 ${
                    isActive
                      ? "bg-white text-blue-950 shadow-sm"
                      : "hover:bg-blue-800 hover:text-white"
                  }`
                }
              >
                Repayments
              </NavLink>
            </div>
          )}
        </div>

        {/* Logout */}
        <div className="mt-auto px-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <div className="flex cursor-pointer gap-2 items-center hover:text-red-400">
                <LogOut />
                <h1 className="font-bold">Log-out</h1>
              </div>
            </AlertDialogTrigger>

            <AlertDialogContent className="font-head">
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Are You Sure You want to Log-Out?
                </AlertDialogTitle>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="w-28 h-10 rounded-full font-bold border-black">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  className="w-28 h-10 rounded-full font-bold"
                  onClick={logout}
                >
                  Yes, Log out
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-1 bg-white">
          <div>
            <h1 className="text-2xl font-semibold">
              Hi {fullName.split(" ")[0]}
            </h1>
            <p className="text-muted-foreground text-xl">
              Welcome back, here’s your loan overview
            </p>
          </div>

          <div className="flex items-center gap-2 bg-gray-100 h-12 rounded-full p-2">
            <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center text-md font-bold">
              {initials}
            </div>
            <span className="font-normal text-lg">{fullName}</span>
          </div>
        </div>

        {/* Outlet scrolls within screen */}
        <div className="flex-1 overflow-y-auto bg-muted/10 p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default BorrowerMain;
