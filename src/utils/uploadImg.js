import cloudinary from "../config/cloudinary.js";
import { INTERNAL_SERVER_ERROR } from "../constants/http.js";
import AppAssert from "./Appassert.js";

export const handleUploadImage = async (image) => {
  const upload = await cloudinary.uploader.unsigned_upload(
    image,
    "travel_maker",
    {
      folder: "travel-makers-images",
    }
  );

  AppAssert(upload, INTERNAL_SERVER_ERROR, "Faild to upload image.");

  return upload.url;
};
