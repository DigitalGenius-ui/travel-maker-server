import { db } from "../../../db/db.js";

// get single user
export const userDetails = async (req, res, next) => {
  const id = req.query.id;

  try {
    const user = await db.user.findFirst({
      where: { id },
      include: {
        profile: true,
        bookings: true,
        moments: true,
        reviews: { include: { user: { include: { profile: true } } } },
      },
    });
    res.status(200).json({ status: "SUCCESS", user });
  } catch (error) {
    next(error);
  }
};
