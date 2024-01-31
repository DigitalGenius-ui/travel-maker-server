import jwt from "jsonwebtoken";
import { errorHandler } from "../../../errorHandling/error.js";

export const verifyToken = async (req, res, next) => {
  const cookie = req.headers["authorization"];
  const token = cookie && cookie.split(" ")[1];

  try {
    if (!token) {
      return next(errorHandler(404, "Token is not found!"));
    } else {
      jwt.verify(token, process.env.ACCESS_SECRET, async (err, user) => {
        if (err || !user) {
          return next(errorHandler(403, "User is not authorized"));
        }
        req.user = user;
        next();
      });
    }
  } catch (error) {
    next(error);
  }
};
