import jwt from "jsonwebtoken";
import { ACCESS_SECRET, REFRESH_SECRET } from "../constants/env.js";

const options = {
  audience: ["user"],
};

export const generateToken = ({ payload, type }) => {
  const refreshToken = type === "refreshToken";
  const secret = refreshToken ? REFRESH_SECRET() : ACCESS_SECRET();
  return jwt.sign(payload, secret, {
    ...options,
    expiresIn: refreshToken ? "30d" : "15m",
  });
};

export const verifyToken = (token, type) => {
  const refreshToken = type === "refreshToken";
  const secret = refreshToken ? REFRESH_SECRET() : ACCESS_SECRET();
  try {
    const payload = jwt.verify(token, secret, {
      ...options,
    });
    return { payload };
  } catch (error) {
    return {
      error: error.message || "Token verification failed",
    };
  }
};
