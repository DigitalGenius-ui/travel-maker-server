import catchError from "../utils/catchError.js";
import {
  getSingleUser,
  updateImage,
  updateProfileDetails,
} from "../services/user-service.js";
import { NOT_FOUND, OK } from "../constants/http.js";
import AppAssert from "../utils/Appassert.js";

// get current singleUserDetails
export const getSingleUserHandler = catchError(async (req, res) => {
  const userId = req.userId;
  AppAssert(userId, NOT_FOUND, "UserId is not provided!");

  const { user } = await getSingleUser({ userId });

  return res.status(OK).json(user);
});

// get current singleUserDetails
export const updateProfileDetailsHandler = catchError(async (req, res) => {
  const body = req.body;
  const userId = req.userId;

  await updateProfileDetails({ body, userId });
});

// update image
export const updateImageHandler = catchError(async (req, res) => {
  const userImg = z.string().parse(req.body.userImg);
  const userId = req.userId;
  AppAssert(userImg, NOT_FOUND, "userImg is not provided!");
  AppAssert(userId, NOT_FOUND, "userId is not provided!");

  const { updateProfileImg } = await updateImage({ userImg, userId });

  return res.status(OK).json({ updateProfileImg });
});
