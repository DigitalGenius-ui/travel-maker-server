import { db } from "../../../db/db.js";

export const getProfileDetails = async (req, res) => {
  const id = req.query.id;
  try {
    const profileDetails = await db.profile.findFirst({
      where: { id },
    });

    res.status(200).json({ status: "SUCCESS", profileDetails });
  } catch (error) {
    throw new Error(error.message);
  }
};
export const updateProfileDetails = async (req, res) => {
  const body = req.body;
  const id = req.query.id;
  try {
    const updateDetails = await db.profile.update({
      where: { id },
      data: { body },
    });
    res.status(200).json({ status: "SUCCESS", updateDetails });
  } catch (error) {
    throw new Error(error.message);
  }
};
