import jwt from "jsonwebtoken";
import { db } from "../../db/db.js";

export const verifyToken = async (req, res, next) => {
  const header = req.headers.authorization || req.headers.Authorization;

  try {
    if (header) {
      const token = header.split(" ")[1];
      jwt.verify(token, process.env.ACCESS_SECRET, async (err, user) => {
        if (err || !user) {
          res
            .status(401)
            .json({ status: "ERROR", message: "User is not authorized" });
        }
        const newUser = await db.user.findFirst({
          where: { id: user.userId },
          select: {
            id: true,
            email: true,
            role: true,
          },
        });

        req.user = newUser;
        next();
      });
    }
  } catch (error) {
    res.clearCookie("accessToken");
    throw new Error(error.message);
  }
};
