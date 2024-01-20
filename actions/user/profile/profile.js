import { db } from "../../../db/db.js";

export const getProfileDetails = async (req, res, next) => {
  const id = req.query.id;
  try {
    const profileDetails = await db.profile.findFirst({
      where: { userId: id },
    });

    res.status(200).json({ status: "SUCCESS", profileDetails });
  } catch (error) {
    next(error);
  }
};

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
