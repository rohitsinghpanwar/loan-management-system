import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from "cloudinary";
import fs from "fs";
import streamifier from "streamifier";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadOnCloudinary = async (
  fileInput: Buffer | string
): Promise<UploadApiResponse | null> => {
  try {
    if (!fileInput) throw new Error("No file provided for upload");

    // Handle Buffer uploads (via multer memoryStorage)
    if (Buffer.isBuffer(fileInput)) {
      return await new Promise<UploadApiResponse>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { resource_type: "auto", folder: "uploads" },
          (error?: UploadApiErrorResponse, result?: UploadApiResponse) => {
            if (error) reject(error);
            else if (result) resolve(result);
            else reject(new Error("Unknown Cloudinary error"));
          }
        );
        streamifier.createReadStream(fileInput).pipe(uploadStream);
      });
    }

    // Handle file path uploads (from diskStorage)
    if (typeof fileInput === "string" && fs.existsSync(fileInput)) {
      const response = await cloudinary.uploader.upload(fileInput, {
        resource_type: "auto",
        folder: "uploads",
      });

      fs.unlink(fileInput, () => {}); // clean temp file
      return response;
    }

    throw new Error("Invalid file input type for Cloudinary upload");
  } catch (error: any) {
    console.error("Cloudinary Upload Error:", error.message);

    // clean up if it’s a file path
    if (typeof fileInput === "string" && fs.existsSync(fileInput)) {
      fs.unlink(fileInput, () => {});
    }

    return null;
  }
};
