import { useEffect, useState } from "react";
import axios from "axios";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Input } from "../ui/input";
interface KycDocument {
  docType?: string;
  url?: string;
}

interface KycData {
  kyc_status: "under_review" | "approved" | "rejected";
  documents: KycDocument[];
  rejectionReason?: string;
}

interface ProfileData {
  fullName: string;
  email: string;
  address: string;
  city: string;
  state: string;
}

interface User {
  _id: string;
  profile: ProfileData;
  phone: string;
  role: string;
  signupStage: string;
  kyc: KycData;
}

export default function AdminKycRequests() {
  const [kycRequests, setKycRequests] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDocs, setSelectedDocs] = useState<KycDocument[]>([]);
  const [openDocs, setOpenDocs] = useState(false);

  // Dialog states
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    fetchKycRequests();
  }, []);

  const fetchKycRequests = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_NODE_URI}api/v1/borrower/kyc-requests`,
        { withCredentials: true }
      );
      setKycRequests(res.data.users);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load KYC requests");
    } finally {
      setLoading(false);
    }
  };

  const updateKycStatus = async (
    userId: string,
    status: "approved" | "rejected",
    reason?: string
  ) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_NODE_URI}api/v1/borrower/kyc-status/${userId}`,
        {
          signupStage:
            status === "approved" ? "completed" : "kyc_pending",
          kyc_status: status,
          ...(reason ? { rejectionReason: reason } : {}),
        },
        { withCredentials: true }
      );
      toast.success(`KYC ${status}`);
      fetchKycRequests();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update KYC status");
    }
  };

  const pending = kycRequests.filter(
    (u) => u.kyc.kyc_status === "under_review"
  );
  const approved = kycRequests.filter((u) => u.kyc.kyc_status === "approved");
  const rejected = kycRequests.filter((u) => u.kyc.kyc_status === "rejected");
  console.log(approved,rejected,pending,kycRequests)

  const handleApproveClick = (userId: string) => {
    setCurrentUserId(userId);
    setConfirmDialogOpen(true);
  };

  const handleRejectClick = (userId: string) => {
    setCurrentUserId(userId);
    setRejectReason("");
    setRejectDialogOpen(true);
  };

  const renderUserCard = (user: User, showActions = false) => (
    <div
      key={user._id}
      className="border rounded-xl p-4 shadow-sm w-full md:w-[350px]"
    >
      <p className="font-semibold">{user.profile.fullName || "Unnamed User"}</p>
      <p className="text-sm text-muted-foreground">
        Email: {user.profile.email || "No Email"}
      </p>
      <p className="text-sm text-muted-foreground">Phone: {user.phone}</p>
      <p className="text-sm text-muted-foreground">
        Address: {user.profile.address}, {user.profile.city},{" "}
        {user.profile.state}
      </p>
      {user.kyc.kyc_status === "rejected" && user.kyc.rejectionReason && (
        <p className="text-sm text-destructive">
          Reason for Rejection: {user.kyc.rejectionReason}
        </p>
      )}
      {showActions && (
        <div className="flex gap-2 mt-2">
          <Button
            variant="outline"
            className="bg-[#F3F3F5] rounded-full"
            onClick={() => {
              setSelectedDocs(user.kyc.documents);
              setOpenDocs(true);
            }}
          >
            View Docs
          </Button>
          <Button
            variant="outline"
            className="bg-[#F3F3F5] rounded-full"
            onClick={() => handleApproveClick(user._id)}
          >
            Approve
          </Button>
          <Button
            variant="outline"
            className="bg-[#F3F3F5] rounded-full"
            onClick={() => handleRejectClick(user._id)}
          >
            Reject
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="">
      <h1 className="text-xl font-semibold mb-4">KYC Requests</h1>
      <Tabs defaultValue="pending">
        <TabsList className="rounded-full mb-6 gap-2">
          <TabsTrigger value="pending" className="w-25 h-8 py-1.25 px-3 data-[state=active]:bg-black data-[state=active]:text-white rounded-full transition-all ease-in-out duration-300 bg-[#F3F3F5]">Pending {`(${pending.length})`}</TabsTrigger>
          <TabsTrigger value="approved" className="w-25 h-8 py-1.25 px-3 data-[state=active]:bg-black data-[state=active]:text-white rounded-full transition-all ease-in-out duration-300 bg-[#F3F3F5]">Approved {`(${approved.length})`}</TabsTrigger>
          <TabsTrigger value="rejected" className="w-25 h-8 py-1.25 px-3 data-[state=active]:bg-black data-[state=active]:text-white rounded-full transition-all ease-in-out duration-300 bg-[#F3F3F5]">Rejected {`(${rejected.length})`}</TabsTrigger>
        </TabsList>


        <TabsContent value="pending">
          {loading ? (
            <p>Loading...</p>
          ) : pending.length > 0 ? (
            <div className="flex flex-wrap gap-4">
              {pending.map((u) => renderUserCard(u, true))}
            </div>
          ) : (
            <p>No pending requests</p>
          )}
        </TabsContent>

        <TabsContent value="approved">
          {loading ? (
            <p>Loading...</p>
          ) : approved.length > 0 ? (
            <div className="flex flex-wrap gap-4">
              {approved.map((u) => renderUserCard(u))}
            </div>
          ) : (
            <p>No Approved requests</p>
          )}
        </TabsContent>

        <TabsContent value="rejected">
          {loading ? (
            <p>Loading...</p>
          ) : rejected.length > 0 ? (
            <div className="flex flex-wrap gap-4">
              {rejected.map((u) => renderUserCard(u))}
            </div>
          ) : (
            <p>No Rejected requests</p>
          )}
        </TabsContent>
      </Tabs>

      {/* Docs Preview Dialog */}
      <Dialog open={openDocs} onOpenChange={setOpenDocs}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Documents Preview</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            {selectedDocs?.length > 0 ? (
              selectedDocs.map((doc, idx) => (
                <div key={idx} className="border rounded-md p-2">
                  <p className="font-medium mb-2">
                    {doc.docType || `Document ${idx + 1}`}
                  </p>
                  <img
                    src={doc.url}
                    alt={doc.docType}
                    className="w-full h-56 object-cover rounded"
                  />
                </div>
              ))
            ) : (
              <p>No documents available</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Approve Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onOpenChange={() => setConfirmDialogOpen(false)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirm Approval</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to approve this KYC request?</p>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setConfirmDialogOpen(false)}
              className="w-57 h-10 rounded-full font-bold border-black"
            >
              No
            </Button>
            <Button
            className="w-57 h-10 rounded-full font-bold border-black"
              onClick={() => {
                if (currentUserId) updateKycStatus(currentUserId, "approved");
                setConfirmDialogOpen(false);
              }}
            >
              Yes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog
        open={rejectDialogOpen}
        onOpenChange={() => setRejectDialogOpen(false)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Reason for Rejection</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Enter reason here"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            required
            className="text-black font-semibold"
          ></Input>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setRejectDialogOpen(false)}
              className="w-57 h-10 rounded-full font-bold border-black"
            >
              Cancel
            </Button>
            <Button
             className="w-57 h-10 rounded-full font-bold border-black"
              onClick={() => {
                if (!rejectReason.trim())
                  return toast.error("Reason is required to reject!");
                if (currentUserId)
                  updateKycStatus(currentUserId, "rejected", rejectReason);
                setRejectDialogOpen(false);
              }}
            >
              Reject
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
