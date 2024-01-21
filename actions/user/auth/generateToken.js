import jwt from "jsonwebtoken";
import { db } from "../../../db/db.js";

export const getAccessToken = (user) => {
  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.ACCESS_SECRET,
    {
      expiresIn: "15m",
    }
  );
  return token;
};

// generate a new refresh token when the access token is expired
export const generateRefreshToken = async (user) => {
  const refreshToken = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.REFRESH_SECRET,
    { expiresIn: "15d" }
  );

  await db.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
    },
  });

  return refreshToken;
};
