import bcrypt from "bcrypt";
import cloudinary from "../config/cloudinary.js";
import { db } from "../config/db.js";
import AppAssert from "../utils/Appassert.js";
import { CONFLICT, NOT_FOUND, OK, UNAUTHORIZED } from "../constants/http.js";

// get current user details
export const getSingleUser = async ({ userId }) => {
  const user = await db.user.findFirst({
    where: { id: userId },
    include: {
      profile: true,
      bookings: true,
      moments: true,
      sessions: {
        orderBy: {
          createAt: "desc",
        },
      },
      reviews: {
        include: { user: { include: { profile: true } } },
        orderBy: {
          createAt: "desc",
        },
      },
    },
  });

  AppAssert(user, NOT_FOUND, "User is not found!");
  const { sessions, password, ...rest } = user;
  const newSession = sessions.map((s) => {
    if (s.userId === user.id) {
      return {
        ...s,
        isCurrent: true,
      };
    }
  });
  return {
    user: {
      ...rest,
      sessions: newSession,
    },
  };
};

// update user profile
export const updateProfileDetails = async ({ body, userId }) => {
  const isProfileExist = await db.profile.findFirst({
    where: { userId },
  });

  if (isProfileExist) {
    const updateProfile = await db.profile.update({
      where: { userId },
      data: body,
    });
    return res.status(OK).json(updateProfile);
  } else {
    const createProfile = await db.profile.create({
      data: body,
    });
    return res.status(OK).json(createProfile);
  }
};

// update profile image
export const updateImage = async ({ userImg, userId }) => {
  const user = await db.user.findFirst({ where: { id: userId } });
  AppAssert(user, UNAUTHORIZED, "User is not authorized!");

  const result = await cloudinary.uploader.upload(userImg, {
    upload_preset: "travel_maker",
  });
  AppAssert(result, CONFLICT, "Failed to upload image!");

  const updateProfileImg = await db.profile.update({
    where: { userId: user.id },
    data: { userImg: result.secure_url },
  });

  return {
    newUser: updateProfileImg,
  };
};

// create a new post moment
export const createMomentPost = async (req, res, next) => {
  const { title, desc, location, postImages, userId } = req.body;
  try {
    await db.moments.create({
      data: {
        title,
        desc,
        location,
        postImages,
        userId,
      },
    });
    return res
      .status(201)
      .json({ status: "SUCCESS", message: "post has been created" });
  } catch (error) {
    next(error);
  }
};

// remove moment
export const removeMomentPost = async (req, res, next) => {
  const id = req.params.id;
  try {
    await db.moments.delete({
      where: { id },
    });
    return res.status(201).json({
      status: "SUCCESS",
      message: "Post have been removed successfully!",
    });
  } catch (error) {
    next(error);
  }
};

// get single moment post
export const getSingleMomentPost = async (req, res, next) => {
  const id = req.params.id;
  try {
    const post = await db.moments.findFirst({
      where: { id },
      orderBy: {
        createAt: "asc",
      },
      include: {
        user: { include: { profile: true } },
        comments: {
          include: { user: { include: { profile: true } } },
          orderBy: { createAt: "desc" },
        },
      },
    });
    return res.status(201).json({
      status: "SUCCESS",
      post,
    });
  } catch (error) {
    next(error);
  }
};

// get all moment post
export const getAllMomentPosts = async (req, res, next) => {
  try {
    const posts = await db.moments.findMany({});
    return res.status(201).json({
      status: "SUCCESS",
      posts,
    });
  } catch (error) {
    next(error);
  }
};

// create moment comment
export const createMomentComment = async (req, res, next) => {
  const { comment, momentId, userId } = req.body;
  try {
    const createComment = await db.comments.create({
      data: {
        comment,
        momentId,
        userId,
      },
    });
    return res.status(201).json({
      status: "SUCCESS",
      createComment,
    });
  } catch (error) {
    next(error);
  }
};

// remove moment comment
export const removeMomentComment = async (req, res, next) => {
  const id = req.params.id;
  try {
    const createComment = await db.comments.delete({
      where: { id },
    });
    return res.status(201).json({
      status: "SUCCESS",
      createComment,
    });
  } catch (error) {
    next(error);
  }
};

// change password
export const changeUserPassword = async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const id = req.params.id;

  try {
    const findUser = await db.user.findFirst({
      where: { id },
    });

    const comparePass = await bcrypt.compare(
      currentPassword,
      findUser.password
    );

    if (!comparePass) {
      return next(errorHandler(500, "Your current password is wrong."));
    }

    const hashPassword = await bcrypt.hash(newPassword, 12);

    const updatedPassword = await db.user.update({
      where: { id },
      data: {
        password: hashPassword,
      },
    });

    return res.status(200).json({
      status: "SUCCESS",
      updatedPassword,
    });
  } catch (error) {
    next(error);
  }
};
