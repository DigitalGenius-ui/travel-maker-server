import catchError from "../utils/catchError.js";
import {
  createMomentComment,
  createMomentPost,
  getAllMomentPosts,
  getSingleMomentPost,
  getSingleUser,
  removeMomentComment,
  removeMomentPost,
  updateImage,
  updateProfileDetails,
} from "../services/user-service.js";
import { CREATED, NOT_FOUND, OK } from "../constants/http.js";
import AppAssert from "../utils/Appassert.js";
import {
  momentCommentShcema,
  passwordShcema,
  userMomentSchema,
} from "../schemas/user-schemas.js";
import { idSchema } from "../schemas/auth-schema.js";

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

// create momnent!
export const createMomentHandler = catchError(async (req, res) => {
  const data = userMomentSchema.parse(req.body);
  const userId = req.userId;
  const { createMoment } = await createMomentPost(data, userId);

  return res.status(CREATED).json({ createMoment });
});

// remove momnent!
export const removeMomentHandler = catchError(async (req, res) => {
  const id = req.userId;

  await removeMomentPost(id);

  return res.status(OK).json({ message: "Moment is removed!" });
});

// get All momnent!
export const getAllMomentPostHandler = catchError(async (req, res) => {
  const { allMoments } = await getAllMomentPosts();

  return res.status(OK).json(allMoments);
});

// get single momnent!
export const getSingleMomentPostHandler = catchError(async (req, res) => {
  const id = idSchema(req.params.id);

  const { singleMoment } = await getSingleMomentPost(id);

  return res.status(OK).json(singleMoment);
});

// create momnent comment!
export const createMomentCommentPostHandler = catchError(async (req, res) => {
  const data = momentCommentShcema.parse(req.body);
  const userId = req.userId;

  const { createComment } = await createMomentComment(data, userId);

  return res.status(CREATED).json(createComment);
});

// remove momnent!
export const removeMomentCommentHandler = catchError(async (req, res) => {
  const id = req.userId;

  await removeMomentComment(id);

  return res.status(OK).json({ message: "Moment comment is removed!" });
});

// change user's password!
export const changePasswordHandler = catchError(async (req, res) => {
  const data = passwordShcema.parse(req.body);
  const id = req.userId;

  await changeUserPassword(data, id);

  return res.status(OK).json({ message: "Moment comment is removed!" });
});
