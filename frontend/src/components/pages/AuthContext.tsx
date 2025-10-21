import axios from "axios";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";

interface User {
_id: string;
  fullName: string;
  signupStage: "profile_pending" | "kyc_pending" | "completed";
  kyc_status: "pending" | "under_review" | "approved" | "rejected";
  rejectionReason?: string;
  role: "borrower" | "admin";
}

interface AuthContextType {
  user: User | null;
  userInfo: (userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  // ✅ Safely load user from localStorage when app starts
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser && storedUser !== "undefined" && storedUser !== "null") {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } else {
        localStorage.removeItem("user"); // cleanup invalid data
      }
    } catch (error) {
      console.warn("Invalid user data in localStorage, clearing it...");
      localStorage.removeItem("user");
    }
  }, []);

  const userInfo = (userData: User) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_NODE_URI}api/v1/borrower/logout`,
        {},
        { withCredentials: true }
      );
    } catch (error) {
      console.log("Logout request failed:", error);
    } finally {
      localStorage.removeItem("user");
      setUser(null);
      navigate("/login");
    }
  };

  return (
    <AuthContext.Provider value={{ user, userInfo, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};
