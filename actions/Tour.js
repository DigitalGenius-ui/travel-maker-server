import { db } from "../db/db.js";

export const tourData = async (req, res) => {
  try {
    const getTours = await db.tours.findMany({});
    if (getTours) {
      res.status(200).json({ status: "SUCCESS", getTours });
    }
  } catch (error) {
    throw new Error(error.message);
  }
};
