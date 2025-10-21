import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";
import { Button } from "../ui/button";
import { DatePicker } from "./DatePicker";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Spinner } from "../ui/spinner";
import { useAuth } from "./AuthContext";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

function Profile() {
  const [formdata, setFormData] = useState({
    fullName: "",
    email: "",
    dob: undefined as Date | undefined,
    address: "",
    city: "",
    state: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { userInfo } = useAuth();
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formdata, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_NODE_URI}api/v1/borrower/profile`,
        { formdata },
        { withCredentials: true }
      );
      toast.success("Profile Setup Successfully");
      userInfo(response.data.user);
      navigate("/kyc");
    } catch (error) {
      toast.error("Error in setting up your profile");
    } finally {
      setLoading(false);
    }
  };
  const isFormComplete =
    formdata.fullName.trim() &&
    formdata.email.trim() &&
    formdata.address.trim() &&
    formdata.city.trim() &&
    formdata.state.trim() &&
    formdata.dob;
  const states_ut = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
    "Andaman and Nicobar Islands",
    "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi",
    "Jammu and Kashmir",
    "Ladakh",
    "Lakshadweep",
    "Puducherry",
  ];
  return (
    <div className="flex flex-col justify-center items-center min-h-screen">
      <div className="flex flex-col items-center w-2xl font-head border rounded-xl gap-5 p-5 bg-[#FCFCF9]">
        <div className="flex flex-col justify-center items-center">
          <h1 className="font-extrabold text-3xl font-head">
            Setup your profile
          </h1>
          <h2 className="text-lg font-head text-muted-foreground">
            Keep your details up to date for faster loan approvals
          </h2>
        </div>
        <form
          action=""
          className="w-md h-[518px] flex flex-col justify-between gap-4.5"
          onSubmit={handleSubmit}
        >
          <div className="flex w-full h-16 flex-col p-2 justify-center  border border-input rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:border-ring">
            <label htmlFor="" className="font-medium text-xs">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              value={formdata.fullName}
              onChange={handleChange}
              required
              placeholder="Enter Full Name"
              className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground font-semibold"
            />
          </div>
          <div className="flex w-full h-16 flex-col p-2 justify-center  border border-input rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:border-ring">
            <label htmlFor="" className="font-medium text-xs">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formdata.email}
              onChange={handleChange}
              required
              placeholder="Enter Email"
              className="flex-1 bg-transparent outline-none  text-foreground placeholder:text-muted-foreground font-semibold"
            />
          </div>
          <div className="flex w-full h-16 flex-col p-2 border border-input rounded-md focus-within:ring-2 focus-within:ring-ring">
            <label className="font-medium text-xs">Date of Birth</label>
            <DatePicker
              value={formdata.dob}
              onChange={(date) => setFormData({ ...formdata, dob: date })}
            />
          </div>
          <div className="flex w-full h-16 flex-col p-2 justify-center  border border-input rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:border-ring">
            <label htmlFor="" className="font-medium text-xs">
              Address
            </label>
            <input
              type="text"
              name="address"
              value={formdata.address}
              onChange={handleChange}
              required
              placeholder="Enter Address"
              className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground font-semibold"
            />
          </div>
          <div className="flex w-full h-16 flex-col p-2 justify-center  border border-input rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:border-ring">
            <label htmlFor="" className="font-medium text-xs">
              City
            </label>
            <input
              type="text"
              name="city"
              value={formdata.city}
              onChange={handleChange}
              required
              placeholder="Enter City"
              className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground font-semibold"
            />
          </div>
          <div className="flex w-full h-16 flex-col p-2 justify-center border border-input rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:border-ring">
            <label className="font-medium text-xs">State/UT</label>
            <Select
              value={formdata.state}
              onValueChange={(val) => setFormData({ ...formdata, state: val })}
            >
              <SelectTrigger className="w-full outline-none border-hidden p-0 font-bold shadow-none focus-visible:ring-0">
                <SelectValue placeholder="Select a State/UT" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>States & UTs</SelectLabel>
                  {states_ut.map((val) => (
                    <SelectItem key={val} value={val}>
                      {val}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            className="w-full h-14 text-lg rounded-full"
            disabled={!isFormComplete || loading}
          >
            {loading && <Spinner />}
            Save
          </Button>
        </form>
      </div>
    </div>
  );
}

export default Profile;
