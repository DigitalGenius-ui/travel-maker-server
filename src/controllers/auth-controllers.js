import { db } from "../config/db.js";
import { CONFLICT, OK, UNAUTHORIZED } from "../constants/http.js";
import { loginSchema, registerSchemas } from "../schemas/auth-schema.js";
import {
  loginUser,
  refreshAcessToken,
  registerUser,
} from "../services/auth-services.js";
import AppAssert from "../utils/Appassert.js";
import catchError from "../utils/catchError.js";
import {
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
  setAccessToken,
  setClearCookie,
} from "../utils/cookie.js";
import { verifyToken } from "../utils/JWTToken.js";

export const registerHandler = catchError(async (req, res) => {
  const validInputs = registerSchemas.parse({
    ...req.body,
    userAgent: req.headers["user-agent"],
  });
  AppAssert(validInputs, CONFLICT, "Please add valid Email & password");

  const { accessToken, refreshToken } = await registerUser(validInputs);

  return setAccessToken({ res, accessToken, refreshToken })
    .status(OK)
    .json({ message: "User is created successfully!" });
});

export const loginHandler = catchError(async (req, res) => {
  const validInputs = loginSchema.parse({
    ...req.body,
    userAgent: req.headers["user-agent"],
  });
  AppAssert(validInputs, CONFLICT, "Please add valid Email & password");

  const { accessToken, refreshToken } = await loginUser(validInputs);

  return setAccessToken({ res, accessToken, refreshToken })
    .status(OK)
    .json({ message: "User is loggedin successfully!" });
});

export const logOutHandler = catchError(async (req, res) => {
  const accessToken = req.cookies.accessToken;
  AppAssert(accessToken, UNAUTHORIZED, "Token is not provided!");

  const { payload, error } = verifyToken(accessToken, "accessToken");
  AppAssert(!error, UNAUTHORIZED, "User is not authorized!");

  // remove session
  await db.sessionModelCode.delete({ where: { id: payload.sessionId } });

  return setClearCookie(res)
    .status(OK)
    .json({ message: "User is logged out!" });
});

export const refreshTokenHandler = catchError(async (req, res) => {
  const isRefreshToken = req.cookies.refreshToken;
  AppAssert(isRefreshToken, UNAUTHORIZED, "Token is not provided!");

  const { accessToken, refreshToken } = await refreshAcessToken(isRefreshToken);

  if (refreshToken) {
    return res.cookie(
      "refreshToken",
      refreshToken,
      getRefreshTokenCookieOptions()
    );
  }

  return res
    .cookie("accessToken", accessToken, getAccessTokenCookieOptions())
    .status(OK)
    .json({ message: "Access Token is refreshed!" });
});
