import { db } from "../../../db/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getAccessToken, getRefreshToken } from "./generateToken.js";
import { errorHandler } from "../../../errorHandling/error.js";

// register functionality
export const register = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(errorHandler(401, "Please provide Email and Password."));
  }

  try {
    const userExisting = await db.user.findUnique({
      where: { email },
    });

    if (userExisting) {
      return next(errorHandler(409, "This email is taken."));
    }

    const hashPassword = await bcrypt.hash(password, 12);

    await db.user.create({
      data: {
        email,
        password: hashPassword,
      },
    });

    res
      .status(201)
      .json({ status: "SUCCESS", message: "User has been created." });

    next();
  } catch (error) {
    next(error);
  }
};

// login functionality
export const login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(errorHandler(404, "Please provide email and password!"));
  }

  try {
    const emailExist = await db.user.findUnique({
      where: { email },
    });

    if (!emailExist) {
      return next(errorHandler(404, "Invalid Credential!!"));
    }

    const passwordMatching = await bcrypt.compare(
      password,
      emailExist.password
    );

    if (!passwordMatching) {
      return next(errorHandler(404, "Invalid Credential!!"));
    }

    // add refresh and access tokens in cookie
    const accessToken = getAccessToken(emailExist);
    const refreshToken = getRefreshToken(emailExist);

    const addToken = await db.user.update({
      where: { id: emailExist.id },
      data: {
        refreshToken,
      },
    });

    if (addToken) {
      emailExist.password = undefined;

      res.cookie("refreshToken", refreshToken, {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
      });

      return res
        .status(200)
        .json({ status: 200, accessToken, user: emailExist });
    }
  } catch (error) {}
  next(error);
};

// logout functionality
export const logOut = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return next(errorHandler(401, "Refresh token is not valid!"));
  }
  try {
    // clear the cookies
    res.clearCookie("token", {
      expiresIn: new Date(0),
      httpOnly: true,
    });
    res.clearCookie("refreshToken", {
      expiresIn: new Date(0),
      httpOnly: true,
    });

    res
      .status(200)
      .json({ status: "SUCCESS", message: "User has been logged out." });
  } catch (error) {
    next(error);
  }
};

// get refresh token to update the accessToken
export const refreshToken = async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;

  try {
    if (!refreshToken) {
      return next(errorHandler(403, "User is unAuthorized!"));
    }

    const refreshTokenExist = await db.user.findFirst({
      where: { refreshToken },
    });

    if (!refreshTokenExist) {
      return next(errorHandler(404, "Invalid token!"));
    }

    jwt.verify(refreshToken, process.env.REFRESH_SECRET, async (err, user) => {
      if (err || !user) {
        return next(errorHandler(404, "Invalid token!"));
      }

      await db.user.update({
        where: { id: refreshTokenExist?.id },
        data: {
          refreshToken: "",
        },
      });

      // generate new access and refresh tokens
      const newAccessToken = getAccessToken(user);
      const newRefreshToken = getRefreshToken(user);

      const newToken = await db.user.update({
        where: { id: refreshTokenExist?.id },
        data: { refreshToken: newRefreshToken },
      });

      if (newToken) {
        res.cookie("refreshToken", newRefreshToken, {
          maxAge: 24 * 60 * 60 * 1000,
          httpOnly: true,
        });

        return res.status(200).json({
          status: "SUCCESS",
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          user,
        });
      }
    });
  } catch (error) {
    next(error);
  }
};
