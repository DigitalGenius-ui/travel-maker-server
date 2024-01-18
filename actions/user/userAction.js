import { db } from "../../db/db.js";
import bcrypt from "bcrypt";
import { getCookies } from "./getCookies.js";
import jwt from "jsonwebtoken";
import { getAccessToken } from "./generateToken.js";

// register functionality
export const register = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(200)
      .json({ status: "ERROR", message: "Please provide email and password!" });
  }

  try {
    const userExisting = await db.user.findUnique({
      where: { email },
    });

    if (userExisting) {
      return res
        .status(200)
        .json({ status: "ERROR", message: "This email is taken." });
    }

    const hashPassword = await bcrypt.hash(password, 12);

    await db.user.create({
      data: {
        email,
        password: hashPassword,
      },
    });

    res
      .status(200)
      .json({ status: "SUCCESS", message: "User has been created." });

    next();
  } catch (error) {
    throw new Error(error.message);
  }
};

// login functionality
export const login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(200)
      .json({ status: "ERROR", message: "Please provide email and password!" });
  }

  try {
    const emailExist = await db.user.findUnique({
      where: { email },
    });

    if (!emailExist) {
      return res
        .status(400)
        .json({ status: "ERROR", message: "This email is not exist." });
    }

    const passwordMatching = await bcrypt.compare(
      password,
      emailExist.password
    );

    if (!passwordMatching) {
      return res
        .status(200)
        .json({ status: "ERROR", message: "Wrong password!" });
    }

    // store refresh and access tokens in cookie
    await getCookies(emailExist, res);

    next();
  } catch (error) {
    throw new Error(error.message);
  }
};

// logout functionality
export const logOut = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    res
      .status(401)
      .json({ status: "ERROR", message: "Refresh token is not valid!" });
  }
  try {
    // remove refresh token
    await db.refreshToken.delete({
      where: { token: refreshToken },
    });

    // clear the cookies

    res.clearCookie("refreshToken", {
      httpOnly: true,
      expiresIn: new Date(0),
    });

    res
      .status(200)
      .json({ status: "SUCCESS", message: "User has been logged out." });
  } catch (error) {
    throw new Error(error.message);
  }
};

// get refresh token to update the accessToken
export const refreshToken = async (req, res) => {
  const token = req.headers.cookie;
  const refreshToken = token.split("=")[1];

  try {
    if (!refreshToken) {
      res
        .status(404)
        .json({ status: "ERROR", message: "User is unAuthorized!" });
    }

    const refreshTokenExist = await db.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!refreshTokenExist) {
      res.status(500).json({ status: "ERROR", message: "Invalid token!" });
    }

    jwt.verify(refreshToken, process.env.REFRESH_SECRET, async (err, user) => {
      if (err) {
        res.status(500).json({ status: "ERROR", message: "Invalid token!" });
      }

      const newUser = await db.user.findFirst({
        where: { id: user.userId },
      });

      // generate new access and refresh tokens
      const accessToken = getAccessToken(newUser);

      return res
        .status(200)
        .json({ status: "SUCCESS", accessToken, user: newUser });
    });
  } catch (error) {
    throw new Error(error.message);
  }
};

// get all user
export const allUsers = async (req, res) => {
  try {
    const users = await db.user.findMany({});
    res.status(201).json({ status: "SUCCESS", users });
  } catch (error) {
    throw new Error(error.message);
  }
};
