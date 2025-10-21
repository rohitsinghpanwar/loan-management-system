import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import reviewAnimation from "../../assets/hourglass.mp4";
import rejectAnimation from "../../assets/reject.mp4"
import { useAuth } from "./AuthContext";

function KycReview() {
  const {user}=useAuth()
  const rejectionReason=user?.rejectionReason
  return (
    <div className="flex justify-center items-center h-screen bg-muted/30">
      <Card className="w-[400px] text-center shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
           {rejectionReason?"KYC Rejected":"KYC Under Review"} 
          </CardTitle>
          <CardDescription>
           {rejectionReason?`Reason - ${rejectionReason}` : "Your KYC documents have been submitted successfully and are now under review by our team."}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col items-center space-y-3">
          <video
            src={rejectionReason?rejectAnimation:reviewAnimation}
            autoPlay
            loop
            muted
            playsInline
            className="w-32 h-32 rounded-md"
          />
          <p className="text-sm text-muted-foreground">
            {rejectionReason?`Try signup with another phone number or Request a KYC review `:"Please check back later. You’ll get access to your dashboard once your verification is complete."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default KycReview
