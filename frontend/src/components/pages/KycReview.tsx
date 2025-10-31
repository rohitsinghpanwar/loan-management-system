import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import reviewAnimation from "../../assets/hourglass.mp4";
import rejectAnimation from "../../assets/reject.mp4";
import { useAuth } from "../../context/AuthContext";

function KycReview() {
  const { user } = useAuth();
  const rejectionReason = user?.rejectionReason;

  const message = rejectionReason
    ? `Reason - ${rejectionReason}`
    : "Your KYC documents have been submitted successfully and are now under review by our team.";

  const subText = rejectionReason
    ? "Try signing up with another phone number or request a KYC review."
    : "Please check back later. You’ll get access to your dashboard once your verification is complete.";

  return (
    <div className="flex justify-center items-center h-screen bg-muted/30 p-4">
      <Card className="w-full max-w-md text-center shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            {rejectionReason ? "KYC Rejected" : "KYC Under Review"}
          </CardTitle>

          {/*Scrollable + responsive description */}
          <CardDescription
            className="break-words whitespace-pre-wrap rounded-md p-2 text-sm max-h-28 overflow-y-auto"
          >
            {message}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col items-center space-y-3">
          <video
            src={rejectionReason ? rejectAnimation : reviewAnimation}
            autoPlay
            loop
            muted
            playsInline
            className="w-32 h-32 rounded-md"
          />
          <p className="text-sm text-muted-foreground px-4 leading-relaxed">
            {subText}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default KycReview;
