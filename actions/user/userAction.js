import { db } from "../../db/db.js";
import bcrypt from "bcrypt";
import { getCookies } from "./getCookies.js";

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

    const newUser = await db.user.create({
      data: {
        email,
        password: hashPassword,
      },
    });

    getCookies(newUser, res);

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
        .status(200)
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

    getCookies(emailExist, res);
    next();
  } catch (error) {
    throw new Error(error.message);
  }
};

// logout functionality
export const logOut = async (req, res) => {
  try {
    res.cookie("accessToken", "", {
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

// get all user
export const allUsers = async (req, res) => {
  try {
    const users = await db.user.findMany({});
    res.status(201).json({ status: "SUCCESS", users });
  } catch (error) {
    throw new Error(error.message);
  }
};
