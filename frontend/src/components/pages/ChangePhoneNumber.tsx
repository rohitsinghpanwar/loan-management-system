import { useState } from "react";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
interface Props {
  setPhone: (phone: string) => void;
  closeDialog: () => void;
}

function ChangePhoneNumber({ setPhone, closeDialog }: Props) {
  const [phoneInput, setPhoneInput] = useState("");
  const [loading,setLoading]=useState(false)
  const handleSave = () => {
    setLoading(true)
    if (phoneInput.length === 10) {
      setPhone(phoneInput); // update parent
      if (closeDialog) closeDialog(); // close dialog
      alert(`OTP will be sent to ${phoneInput}`);
      
    } else {
      alert("Please enter a valid 10-digit number");
    }
    setLoading(false)
  };

  return (
    <div className="flex flex-col items-center justify-center gap-12 p-6 bg-white rounded-xl">
      <h1 className="font-bold text-xl">Enter Mobile Number</h1>
      <div className="flex w-full h-16 flex-col p-2 justify-center border border-input rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:border-ring">
        <label className="text-sm font-medium text-muted-foreground">Phone</label>
        <div className="flex items-center gap-1">
          <span className="text-lg">🇮🇳</span>
          <span className="text-muted-foreground font-medium">+91</span>
          <div className="h-5 w-px bg-muted mx-1" />
          <input
            type="tel"
            inputMode="numeric"
            placeholder="1222005674"
            maxLength={10}
            value={phoneInput}
            onChange={(e) => {
              const cleaned = e.target.value.replace(/\D/g, "");
              setPhoneInput(cleaned);
            }}
            className="flex-1 bg-transparent outline-none text-lg text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>
      <Button
        className="h-14 w-full rounded-4xl border border-black text-lg"
        onClick={handleSave}
      disabled={loading}>
        {loading && (
            <Spinner/>
          )}
        Save & Send OTP
      </Button>
    </div>
  );
}

export default ChangePhoneNumber;
