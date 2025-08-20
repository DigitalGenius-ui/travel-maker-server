import catchError from "../utils/catchError.js";
import {
  changeUserPassword,
  createMomentComment,
  createMomentPost,
  getAllMomentPosts,
  getAllTickets,
  getAllUsers,
  getSingleMomentPost,
  getSingleUser,
  getUserBookings,
  getUserMoments,
  getUserReviews,
  removeMomentComment,
  removeMomentPost,
  removeUser,
  updateImage,
  updateProfileDetails,
} from "../services/user-service.js";
import {
  CONFLICT,
  CREATED,
  NOT_FOUND,
  OK,
  UNAUTHORIZED,
} from "../constants/http.js";
import AppAssert from "../utils/Appassert.js";
import {
  momentCommentShcema,
  passwordShcema,
  updateUserSchema,
  userMomentSchema,
} from "../schemas/user-schemas.js";
import { idSchema } from "../schemas/auth-schema.js";
import { z } from "zod";
import { db } from "../config/db.js";

// get all users
export const getAllUsersHandler = catchError(async (req, res) => {
  const page = z.number().parse(+req.query.page);
  const limit = z.number().parse(+req.query.limit);
  const type = z.string().parse(req.query.type);
  const search = z.string().optional().parse(req.query.search);

  const isAdmin = req.admin === "ADMIN";

  const userId = req.userId;

  AppAssert(
    isAdmin && userId,
    UNAUTHORIZED,
    "You are not authorized to access this route!"
  );

  const { users, totalPages, totalTickets } = await getAllUsers({
    userId,
    page,
    limit,
    type,
    search,
  });

  return res.status(OK).json({ users, totalPages, totalTickets });
});

// get current singleUserDetails
export const getCurrentUserHandler = catchError(async (req, res) => {
  const accessToken = req.cookies.accessToken;
  AppAssert(accessToken, NOT_FOUND, "AccessToken is not provided!");

  const userId = req.userId;
  AppAssert(userId, NOT_FOUND, "UserId is not provided!");

  const { user } = await getSingleUser({ userId });

  return res.status(OK).json({ user, accessToken });
});

// update user profile data
export const updateUserDetailsHandler = catchError(async (req, res) => {
  const body = updateUserSchema.parse(req.body);
  const admin = req.admin === "ADMIN";

  AppAssert(admin, NOT_FOUND, "You are not authorized to access this route!");

  const update = await db.user.update({
    where: { id: body.userId },
    data: {
      role: body.role,
      verified: body.verified,
    },
  });

  AppAssert(update, CONFLICT, "Failed to update user!");

  return res.status(OK).json({ message: "User details updated successfully!" });
});

// remove user
export const removeUserHandler = catchError(async (req, res) => {
  const id = idSchema.parse(req.params.id);
  const admin = req.admin === "ADMIN";

  AppAssert(admin, NOT_FOUND, "You are not authorized to access this route!");

  await removeUser(id);

  return res.status(OK).json({ message: "User is removed successfully!" });
});

// get user by id
export const getSingleUserHandler = catchError(async (req, res) => {
  const userId = idSchema.parse(req.params.id);
  AppAssert(userId, NOT_FOUND, "UserId is not provided!");

  const { user } = await getSingleUser({ userId });

  return res.status(OK).json(user);
});

// get current singleUserDetails
export const updateProfileDetailsHandler = catchError(async (req, res) => {
  const body = req.body;
  const userId = body.userId ?? req.userId;

  await updateProfileDetails({ body, userId, res });
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
  const postId = idSchema.parse(req.params.id);
  const id = req.userId;
  AppAssert(id, UNAUTHORIZED, "UserId is not provided!");

  await removeMomentPost(postId);

  return res.status(OK).json({ message: "Moment is removed!" });
});

// get All momnent!
export const getAllMomentPostHandler = catchError(async (req, res) => {
  const { allMoments } = await getAllMomentPosts();

  return res.status(OK).json(allMoments);
});

// get single momnent!
export const getSingleMomentPostHandler = catchError(async (req, res) => {
  const id = idSchema.parse(req.params.id);

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
  const id = idSchema.parse(req.params.id);
  const userId = req.userId;

  AppAssert(
    userId,
    UNAUTHORIZED,
    "You are not authorized to access this route!"
  );

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

// get single booking by id
export const getUserBookingHandler = catchError(async (req, res) => {
  const page = z.number().parse(+req.query.page);
  const limit = z.number().parse(+req.query.limit);

  const id = req.userId;
  AppAssert(id, UNAUTHORIZED, "userId is not provided!");

  const { bookings, totalPages } = await getUserBookings(id, page, limit);

  return res.status(OK).json({ bookings, totalPages });
});

// get single moments by id
export const getUserMomentsHandler = catchError(async (req, res) => {
  const page = z.number().parse(+req.query.page);
  const limit = z.number().parse(+req.query.limit);

  const id = idSchema.parse(req.params.id);

  const { moments, totalPages } = await getUserMoments(id, page, limit);

  return res.status(OK).json({ moments, totalPages });
});

// get reviews
export const getUserReviewsHandler = catchError(async (req, res) => {
  const page = z.number().parse(+req.query.page);
  const limit = z.number().parse(+req.query.limit);

  const id = req.userId;
  AppAssert(id, UNAUTHORIZED, "userId is not provided!");

  const { reviews, totalPages } = await getUserReviews(id, page, limit);

  return res.status(OK).json({ reviews, totalPages });
});

// get all tickets
export const getAllTicketsHandler = catchError(async (req, res) => {
  const page = z.number().parse(+req.query.page);
  let limit = z.number().parse(+req.query.limit);
  let search = z.string().parse(toString(req.query.search));

  const admin = req.admin;
  AppAssert(
    admin,
    UNAUTHORIZED,
    "You are not authorized to access this route!"
  );

  const { tickets, totalPages, totalTickets } = await getAllTickets(
    page,
    limit,
    search
  );

  return res.status(OK).json({ tickets, totalPages, totalTickets });
});

// update ticket
export const updateTicketHandler = catchError(async (req, res) => {
  const body = req.body;
  const admin = req.admin;
  AppAssert(
    admin,
    UNAUTHORIZED,
    "You are not authorized to access this route."
  );
  AppAssert(body, CONFLICT, "Data is not provided!");

  const { id, ...rest } = body;

  const update = await db.bookings.update({
    where: { id },
    data: {
      ...rest,
      updatedAt: new Date(),
    },
  });

  AppAssert(update, CONFLICT, "Failed to update booking data!");

  return res.status(OK).json({ message: "Ticket has been updated!" });
});

// remove ticket
export const removeTicketHandler = catchError(async (req, res) => {
  const id = idSchema.parse(req.params.id);
  const admin = req.admin;
  AppAssert(
    admin,
    UNAUTHORIZED,
    "You are not authorized to access this route."
  );

  const remove = await db.bookings.delete({
    where: { id },
  });

  AppAssert(remove, CONFLICT, "Failed to remove booking data!");

  return res.status(OK).json({ message: "Ticket has been removed!" });
});
