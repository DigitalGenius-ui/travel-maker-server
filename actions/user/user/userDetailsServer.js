import { db } from "../../../db/db.js";
import { errorHandler } from "../../../errorHandling/error.js";
import bcrypt from "bcrypt";

// get current user details
export const getUserDetailsServer = async (req, res, next) => {
  const userId = req.user.id;
  const id = req.params.id;

  try {
    const user = await db.user.findFirst({
      where: { id: userId || id },
      include: {
        profile: true,
        bookings: true,
        moments: true,
        reviews: { include: { user: { include: { profile: true } } } },
      },
    });

    if (!user) {
      return next(errorHandler(404, "User is not found!"));
    }

    const { password, ...rest } = user;
    return res.status(200).json({ status: "SUCCESS", user: rest });
  } catch (error) {
    next(error);
  }
};

// update user profile
export const updateProfileDetails = async (req, res, next) => {
  const body = req.body;

  try {
    const isProfileExist = await db.profile.findFirst({
      where: { userId: body.userId },
    });

    if (isProfileExist) {
      const updateProfile = await db.profile.update({
        where: { userId: body.userId },
        data: body,
      });
      return res.status(200).json({ status: "SUCCESS", updateProfile });
    } else {
      const createProfile = await db.profile.create({
        data: body,
      });
      return res.status(200).json({ status: "SUCCESS", createProfile });
    }
  } catch (error) {
    next(error);
  }
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
