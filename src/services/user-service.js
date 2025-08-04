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
      moments: true,
    },
  });

  AppAssert(user, NOT_FOUND, "User is not found!");
  const { sessions, password, ...rest } = user;
  return {
    user: rest,
  };
};

// get all users
export const getAllUsers = async ({ userId, page, limit }) => {
  const skip = (page - 1) * limit;
  const [allUsers, totalUsers] = await Promise.all([
    db.user.findMany({
      skip,
      take: limit,
      orderBy: {
        createAt: "desc",
      },
      include: {
        profile: true,
      },
    }),
    db.user.count(),
  ]);
  AppAssert(allUsers, NOT_FOUND, "Users are not found!");
  const newUsers = allUsers.filter((user) => user.id !== userId);

  // remove password
  newUsers.map((item) => (item.password = undefined));

  const totalPages = Math.ceil(totalUsers / limit);

  return {
    users: newUsers,
    totalPages,
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

// remove user
export const removeUser = async (id) => {
  const removeSession = await db.sessionModelCode.deleteMany({
    where: { userId: id },
  });
  AppAssert(removeSession, CONFLICT, "Failed to remove sessions!");

  const reviews = await db.reviews.deleteMany({
    where: { userId: id },
  });
  AppAssert(reviews, CONFLICT, "Failed to remove reviews!");

  const bookings = await db.verificationCode.deleteMany({
    where: { userId: id },
  });
  AppAssert(bookings, CONFLICT, "Failed to remove bookings!");

  const moment = await db.moments.deleteMany({
    where: { userId: id },
  });
  AppAssert(moment, CONFLICT, "Failed to remove moments!");

  const comments = await db.verificationCode.deleteMany({
    where: { userId: id },
  });
  AppAssert(comments, CONFLICT, "Failed to remove comments!");

  const verifyCode = await db.verificationCode.deleteMany({
    where: { userId: id },
  });
  AppAssert(verifyCode, CONFLICT, "Failed to remove verifycodes!");

  const removeProfile = await db.profile.delete({
    where: { userId: id },
  });
  AppAssert(removeProfile, CONFLICT, "Failed to remove profile!");

  const removeUser = await db.user.delete({
    where: { id },
  });
  AppAssert(removeUser, CONFLICT, "Failed to remove user!");

  return {
    message: "User removed successfully!",
  };
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
    "Failed to update image in the database!"
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

// get user bookings
export const getUserBookings = async (id, page, limit) => {
  const skip = (page - 1) * limit;
  const [bookings, totalBookings] = await Promise.all([
    db.bookings.findMany({
      where: { userId: id },
      skip,
      take: limit,
      orderBy: {
        createAt: "desc",
      },
    }),
    db.bookings.count(),
  ]);
  AppAssert(bookings, NOT_FOUND, "Bookings are not found!");

  const totalPages = Math.ceil(totalBookings / limit);

  return {
    bookings,
    totalPages,
  };
};

export const getUserMoments = async (id, page, limit) => {
  const skip = (page - 1) * limit;

  const [moments, totalMoments] = await Promise.all([
    db.moments.findMany({
      where: { userId: id },
      skip,
      take: limit,
      orderBy: {
        createAt: "desc",
      },
    }),
    db.moments.count(),
  ]);
  AppAssert(moments, NOT_FOUND, "Moments are not found!");

  const totalPages = Math.ceil(totalMoments / limit);

  return {
    moments,
    totalPages,
  };
};

// get sessions
export const getUserSessions = async (id) => {
  const sessions = await db.sessionModelCode.findMany({
    where: { userId: id },
    orderBy: {
      createAt: "desc",
    },
  });
  AppAssert(sessions, NOT_FOUND, "Sessions are not found!");

  const newSession = sessions.map((s) => {
    if (s.userId === user.id) {
      return {
        ...s,
        isCurrent: true,
      };
    }
  });
  return {
    sessions: newSession,
  };
};

// get reviews
export const getUserReviews = async (id, page, limit) => {
  const skip = (page - 1) * limit;

  const [reviews, totalReviews] = await Promise.all([
    db.reviews.findMany({
      where: { userId: id },
      include: { user: { include: { profile: true } } },
      skip,
      take: limit,
      orderBy: {
        createAt: "desc",
      },
    }),
    db.reviews.count(),
  ]);
  AppAssert(reviews, NOT_FOUND, "Reviews are not found!");

  const totalPages = Math.ceil(totalReviews / limit);

  return {
    reviews,
    totalPages,
  };
};

export const getAllTickets = async (page, limit, search) => {
  const skip = page * limit;

  // Available enum values (for manual check)
  const statusEnums = ["pending", "canceled", "verified"];

  // Build search filters
  const orFilter = [];

  if (search) {
    orFilter.push(
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { verifyNumber: { contains: search, mode: "insensitive" } }
    );

    if (statusEnums.includes(search)) {
      orFilter.push({ status: { equals: search } });
    }
  }

  const where = orFilter.length ? { OR: orFilter } : {};

  const [tickets, totalTickets] = await Promise.all([
    db.bookings.findMany({
      skip,
      take: limit,
      where,
      orderBy: {
        createAt: "desc",
      },
    }),
    db.bookings.count(),
  ]);

  AppAssert(tickets, CONFLICT, "Faild to display tickets!");

  const totalPages = Math.ceil(totalTickets / limit);

  return {
    tickets,
    totalPages,
    totalTickets,
  };
};
