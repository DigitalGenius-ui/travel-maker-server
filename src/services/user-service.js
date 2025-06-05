import bcrypt from "bcrypt";
import cloudinary from "../config/cloudinary.js";
import { db } from "../config/db.js";
import AppAssert from "../utils/Appassert.js";
import {
  CONFLICT,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  OK,
  UNAUTHORIZED,
} from "../constants/http.js";
import { comparePass, hashPassword } from "../utils/bcrypt.js";
import { handleUploadImage } from "../utils/uploadImg.js";

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
export const updateProfileDetails = async ({ body, userId, res }) => {
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
      data: { ...body, userId },
    });
    return res.status(OK).json(createProfile);
  }
};

// update profile image
export const updateImage = async ({ userImg, userId }) => {
  const user = await db.user.findFirst({ where: { id: userId } });
  AppAssert(user, UNAUTHORIZED, "User is not authorized!");

  const result = await handleUploadImage(userImg);
  AppAssert(result, CONFLICT, "Failed to upload image!");

  const updateProfileImg = await db.user.update({
    where: { id: user.id },
    data: { userImg: result },
  });
  AppAssert(
    updateProfileImg,
    CONFLICT,
    "Failed to update image in teh database!"
  );

  return {
    newUser: updateProfileImg,
  };
};

// create a new post moment
export const createMomentPost = async (data, userId) => {
  const { title, desc, location, postImages } = data;

  const createMoment = await db.moments.create({
    data: {
      title,
      desc,
      location,
      postImages,
      userId,
    },
  });
  AppAssert(createMoment, CONFLICT, "Failed to create moment!s");
  return {
    createMoment,
  };
};

// remove moment
export const removeMomentPost = async (id) => {
  const removeMoment = await db.moments.delete({
    where: { id },
  });
  AppAssert(removeMoment, CONFLICT, "Failed to remove moment!");
  return {
    removeMoment,
  };
};

// get single moment post
export const getSingleMomentPost = async (id) => {
  const singleMoment = await db.moments.findFirst({
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
  AppAssert(
    singleMoment,
    INTERNAL_SERVER_ERROR,
    "Failed to get single moment!"
  );
  return { singleMoment };
};

// get all moment post
export const getAllMomentPosts = async (req, res, next) => {
  const posts = await db.moments.findMany({});
  AppAssert(posts, INTERNAL_SERVER_ERROR, "Faild to get all moment!");
  return {
    allMoments: posts,
  };
};

// create moment comment
export const createMomentComment = async (data, userId) => {
  const { comment, momentId } = data;
  const createComment = await db.comments.create({
    data: {
      comment,
      momentId,
      userId,
    },
  });
  AppAssert(
    createComment,
    INTERNAL_SERVER_ERROR,
    "Failed to create moment comment!"
  );
  return { createComment };
};

// remove moment comment
export const removeMomentComment = async (id) => {
  const removeComment = await db.comments.delete({
    where: { id },
  });
  AppAssert(removeComment, INTERNAL_SERVER_ERROR, "Failed to remove comment!");
  return {
    removeComment,
  };
};

// change password
export const changeUserPassword = async (data, id) => {
  const { currentPassword, newPassword } = data;

  const findUser = await db.user.findFirst({
    where: { id },
  });

  AppAssert(findUser, NOT_FOUND, "User is not exist!");

  const isPasswordMatching = await comparePass(
    currentPassword,
    findUser.password
  );
  AppAssert(isPasswordMatching, CONFLICT, "You typed wrong password!");

  const hashedPassword = await hashPassword(newPassword);

  const updatedPassword = await db.user.update({
    where: { id },
    data: {
      password: hashedPassword,
    },
  });

  return { updatedPassword };
};
