import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import documentIcon from "../../assets/document.svg";
import completeIcon from "../../assets/complete.png";
import uploadAnotherIcon from "../../assets/arrow-up-right.svg";
import axios from "axios";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {Trash2,Plus} from "lucide-react";
import  FileIcon  from "../../assets/Frame 1000005462.svg";
import uploadIcon from "../../assets/Vector.png";
import { Progress } from "../ui/progress";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

interface DocumentData {
  id: number;
  type: string;
  file?: File | null;
}

function KycUpload() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<DocumentData[]>([
    { id: 1, type: "", file: null },
  ]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const documentTypes = ["Aadhar Card", "PAN Card"];
  const progressRef = useRef(0);
  const isFormComplete =
    documents.length === documentTypes.length &&
    documents.every((doc) => doc.type && doc.file);

  // --- Handle Type & File Changes ---
  const handleTypeChange = (id: number, value: string) => {
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, type: value } : doc))
    );
  };

  const handleFileChange = (id: number, file: File | null) => {
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, file } : doc))
    );
  };

  const handleAddDocument = () => {
    setDocuments((prev) => [...prev, { id: Date.now(), type: "", file: null }]);
  };

  const handleRemoveDocument = (id: number) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
  };

  // --- Smooth Progress Simulation ---
  const updateProgressSmoothly = (targetProgress: number) => {
    const currentProgress = progressRef.current;
    const increment = targetProgress > currentProgress ? 1 : 0;
    const newProgress = Math.min(currentProgress + increment, targetProgress);

    progressRef.current = newProgress;
    setProgress(newProgress);

    if (newProgress < targetProgress && newProgress < 100) {
      setTimeout(() => updateProgressSmoothly(targetProgress), 50); // Adjust speed here
    }
  };

  const handleSubmit = async () => {
    if (!isFormComplete) return;

    const formData = new FormData();
    documents.forEach((doc) => {
      formData.append("documents", doc.file as Blob);
      formData.append("types", doc.type);
    });

    setUploading(true);
    setProgress(0);
    progressRef.current = 0;

    try {
      await axios.post(
        `${import.meta.env.VITE_NODE_URI}api/v1/borrower/kyc/upload`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (e) => {
            const percent = Math.round((e.loaded * 100) / (e.total || 1));
            // Update progress smoothly, slowing down near 100%
            const targetProgress =
              percent > 90 ? 90 + (percent - 90) * 0.2 : percent;
            updateProgressSmoothly(targetProgress);
          },
        }
      );

      // Complete progress to 100% smoothly
      updateProgressSmoothly(100);

      // Wait for progress to reach 100 before showing success
      const waitForProgress = () =>
        new Promise((resolve) => {
          const checkProgress = () => {
            if (progressRef.current >= 100) {
              resolve(true);
            } else {
              setTimeout(checkProgress, 50);
            }
          };
          checkProgress();
        });

      await waitForProgress();
      setUploading(false);
      setUploadSuccess(true);
      setTimeout(() => {
        navigate("/kyc-review");
      }, 2000);
    } catch (error) {
      console.error("Error uploading:", error);
      setUploading(false);
    }
  };

  // --- Poll Backend for KYC Approval ---
  useEffect(() => {
    if (uploadSuccess) {
      const checkKyc = setInterval(async () => {
        try {
          const { data } = await axios.get(
            `${import.meta.env.VITE_BACKEND_URI}api/v1/users/me`,
            { withCredentials: true }
          );
          if (data.kyc_status === "approved") {
            clearInterval(checkKyc);
            navigate("/user_dashboard");
          } else if (data.kyc_status === "under_review") {
            clearInterval(checkKyc);
            navigate("/kyc-review");
          }
        } catch (err) {
          console.error(err);
        }
      }, 5000);

      return () => clearInterval(checkKyc);
    }
  }, [uploadSuccess, navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="min-w-2xl min-h-[614px] border rounded-2xl bg-[#FCFCF9] p-4 flex flex-col items-center">
        {/* ---- HEADER ---- */}
        <div className="text-center m-5">
          <h1 className="text-3xl font-extrabold font-head">
            Upload KYC Documents
          </h1>
          <p className="text-sm text-muted-foreground mt-2 font-head">
            Verify your identity to proceed with loan applications.
            <br />
            All uploads are secure and encrypted.
          </p>
        </div>

        {/* ---- DOCUMENT SECTIONS ---- */}
        <div className="space-y-2 w-md max-h-100">
          {documents.map((doc, index) => (
            <div key={doc.id} className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-semibold tracking-wide">
                  {index === 0 ? "DOCUMENTS" : "ADDITIONAL DOCUMENTS"}
                </Label>

                {index !== 0 && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button
                        type="button"
                        className="text-red-500 text-sm flex items-center gap-1 hover:text-red-600"
                      >
                        <Trash2 size={14} /> Remove
                      </button>
                    </AlertDialogTrigger>

                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you sure you want to remove the attached document?
                        </AlertDialogTitle>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="border border-black w-57 h-11 rounded-full">
                          No, Go Back
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleRemoveDocument(doc.id)}
                          className="bg-black text-white w-57 h-11 rounded-full"
                        >
                          Yes, Confirm
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>

              <Card className="shadow-white border-hidden p-0">
                <CardContent className="flex flex-col gap-5 p-0">
                  {/* ---- DOCUMENT TYPE ---- */}
                  <div className="h-16 flex flex-col border border-input rounded-md p-2 focus-within:ring-2 focus-within:ring-ring focus-within:border-ring">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Document Type
                    </Label>
                    <Select
                      value={doc.type}
                      onValueChange={(value) => handleTypeChange(doc.id, value)}
                    >
                      <SelectTrigger className="w-full h-6 focus-visible:ring-0 border-none text-foreground placeholder:text-muted-foreground font-semibold shadow-none p-0">
                        <SelectValue placeholder="Choose Document Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {documentTypes
                          .filter(
                            (type) =>
                              !documents.some(
                                (selectedDoc) =>
                                  selectedDoc.type === type &&
                                  selectedDoc.id !== doc.id
                              )
                          )
                          .map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* ---- UPLOAD SECTION ---- */}
                  <div
                    className={`h-20 flex flex-col border-2 border-dashed rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:border-ring ${
                      doc.file ? "bg-[#F2F3EE]" : ""
                    }`}
                  >
                    <Label className="text-xs font-medium text-muted-foreground p-1 ">
                      {doc.type.toUpperCase() || "UPLOAD DOCUMENT"}
                    </Label>

                    {doc.file ? (
                      <div className="flex items-center justify-between font-semibold text-sm px-1">
                        <div className="flex items-center gap-1">
                          <img src={FileIcon} alt="" className="h-6 w-6" />
                          {doc.file.name}
                        </div>
                        <label className="text-sm font-bold cursor-pointer flex flex-col items-end">
                          <img src={uploadAnotherIcon} alt="" />
                          UPLOAD ANOTHER
                          <Input
                            type="file"
                            accept=".pdf,.jpg,.png"
                            className="hidden"
                            onChange={(e) =>
                              handleFileChange(
                                doc.id,
                                e.target.files ? e.target.files[0] : null
                              )
                            }
                          />
                        </label>
                      </div>
                    ) : (
                      <label className="flex items-center gap-2 h-7 text-sm text-muted-foreground cursor-pointer p-1">
                        <img
                          src={uploadIcon}
                          alt="upload icon"
                          className="w-5 h-5"
                        />
                        <span className="text-black font-semibold text-sm">
                          <span className="underline underline-offset-1 font-bold">
                            Click here
                          </span>{" "}
                          to browse your library
                        </span>
                        <Input
                          type="file"
                          accept=".pdf,.jpg,.png"
                          className="hidden"
                          onChange={(e) =>
                            handleFileChange(
                              doc.id,
                              e.target.files ? e.target.files[0] : null
                            )
                          }
                        />
                      </label>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* ---- ADD MORE ---- */}
        <div className=" flex flex-col items-end w-md p-1">
          {documents.length < documentTypes.length ? (
            <button
              type="button"
              onClick={handleAddDocument}
              className="text-sm font-bold flex items-center gap-1 hover:text-foreground"
            >
              <Plus size={14} /> Add More Documents
            </button>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              You can upload a maximum of {documentTypes.length} documents.
            </p>
          )}
        </div>

        {/* ---- SUBMIT ---- */}
        <Button
          disabled={!isFormComplete || uploading}
          onClick={handleSubmit}
          className="w-md mt-2 h-14 rounded-full font-semibold text-[16px]"
        >
          Save
        </Button>

        {/* ---- MODAL OVERLAY ---- */}
        {uploading || uploadSuccess ? (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <AlertDialog open>
              <AlertDialogContent className="max-w-sm w-full rounded-2xl p-0 overflow-hidden">
                {!uploadSuccess ? (
                  <div className="flex flex-col items-center p-6">
                    <h1 className="text-2xl font-bold mb-2 ">
                      KYC Verification
                    </h1>
                    <p className="text-sm text-muted-foreground text-center mb-4">
                      Your documents are being uploaded.
                    </p>
                    <img
                      src={documentIcon}
                      alt="Document"
                      className="w-72 h-44 mb-4"
                    />
                    <p className="text-sm text-muted-foreground text-center mb-4">
                      Hang tight - this usually takes under a minute
                    </p>
                    <Progress
                      value={progress}
                      className="transition-all duration-700 ease-out w-71 h-5 bg-[#EFEFEF] [&>div]:bg-gradient-to-bl [&>div]:from-[#ABACC2] [&>div]:to-[#858699]"
                    />
                    <span className="text-sm text-muted-foreground mt-2">
                      {progress}% processed...
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center p-6">
                    <h1 className="text-2xl font-bold mb-2">
                      Documents Uploaded!
                    </h1>
                    <p className="text-sm text-muted-foreground text-center mb-4">
                      They will be reviewed shortly.
                    </p>
                    <img
                      src={completeIcon}
                      alt="Complete"
                      className="w-64 h-48 mb-4"
                    />
                    <AlertDialogFooter>
                      <Button
                        onClick={() => setUploadSuccess(false)}
                        className="w-md h-14 rounded-full font-bold"
                      >
                        Okay
                      </Button>
                    </AlertDialogFooter>
                  </div>
                )}
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default KycUpload;
