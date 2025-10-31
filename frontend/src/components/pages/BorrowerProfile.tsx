import { useEffect, useState } from "react";
import axios from "axios";
import { Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";
import { parseISO, format } from "date-fns";

interface Profile {
  fullName: string;
  email: string;
  address: string;
  city: string;
  state: string;
  dob: string;
}

interface KYC {
  kyc_status: string;
}

interface UserData {
  _id: string;
  phone: string;
  profile: Profile;
  kyc: KYC;
}

export default function BorrowerProfile() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_NODE_URI}api/v1/borrower/profile`,
          { withCredentials: true }
        );
        setUser(res.data.user);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[60vh] bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );

  if (error)
    return (
      <div className="text-center text-red-600 font-medium mt-12 bg-red-50 p-4 rounded-lg max-w-md mx-auto">
        {error}
      </div>
    );

  if (!user) return null;

  const { profile, phone, kyc } = user;

  const renderKycStatus = () => {
    switch (kyc.kyc_status) {
      case "approved":
        return (
          <div className="flex items-center gap-2 text-green-700 bg-green-100 px-3 py-1 rounded-full font-medium">
            <CheckCircle2 className="w-5 h-5" />
            <span>KYC Approved</span>
          </div>
        );
      case "under_review":
        return (
          <div className="flex items-center gap-2 text-yellow-700 bg-yellow-100 px-3 py-1 rounded-full font-medium">
            <Clock className="w-5 h-5" />
            <span>Under Review</span>
          </div>
        );
      case "rejected":
        return (
          <div className="flex items-center gap-2 text-red-700 bg-red-100 px-3 py-1 rounded-full font-medium">
            <XCircle className="w-5 h-5" />
            <span>Rejected</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 text-gray-600 bg-gray-100 px-3 py-1 rounded-full font-medium">
            <Clock className="w-5 h-5" />
            <span>Pending</span>
          </div>
        );
    }
  };

  return (
    <div className=" flex items-center justify-center p-4 font-robbert">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl">
        <div className="p-6 sm:p-8">
          <h2 className="text-xl sm:text-3xl font-bold text-blue-900 text-center mb-6">
            Personal & KYC Information
          </h2>
          <div className="space-y-6">
            {/* Full Name */}
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg transition-all duration-200 hover:bg-gray-100">
              <span className="text-sm text-gray-500 font-medium">Full Name</span>
              <span className="font-semibold text-gray-800">{profile.fullName}</span>
            </div>

            {/* Email */}
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg transition-all duration-200 hover:bg-gray-100">
              <span className="text-sm text-gray-500 font-medium">Email</span>
              <span className="font-semibold text-gray-800">{profile.email}</span>
            </div>

            {/* Phone */}
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg transition-all duration-200 hover:bg-gray-100">
              <span className="text-sm text-gray-500 font-medium">Phone</span>
              <span className="font-semibold text-gray-800">{phone}</span>
            </div>

            {/* DOB */}
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg transition-all duration-200 hover:bg-gray-100">
              <span className="text-sm text-gray-500 font-medium">Date of Birth</span>
              <span className="font-semibold text-gray-800">
                {format(parseISO(profile.dob), "dd-MM-yyyy")}
              </span>
            </div>

            {/* Address */}
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg transition-all duration-200 hover:bg-gray-100">
              <span className="text-sm text-gray-500 font-medium">Address</span>
              <span className="font-semibold text-gray-800">
                {profile.address}, {profile.city}, {profile.state}
              </span>
            </div>

            {/* Divider */}
            <hr className="border-gray-200 my-4" />

            {/* KYC Status */}
            <div className="flex justify-between items-center p-4">
              <span className="text-sm text-gray-500 font-medium">KYC Status</span>
              {renderKycStatus()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}