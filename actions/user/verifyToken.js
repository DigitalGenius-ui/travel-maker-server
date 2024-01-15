import jwt from "jsonwebtoken";
import { db } from "../../db/db.js";

export const verifyToken = async (req, res, next) => {
  const token = req.cookies.accessToken;

  try {
    if (token) {
      jwt.verify(token, process.env.ACCESS_SECRET, async (err, user) => {
        if (err || !user) {
          res
            .status(404)
            .json({ status: "ERROR", message: "Token is not valid!" });
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
      });
    } else {
      res
        .status(404)
        .json({ status: "ERROR", message: "User is not authorized!!" });
    }

    next();
  } catch (error) {
    res.clearCookie("accessToken");
    throw new Error(error.message);
  }
};
