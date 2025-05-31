import { db } from "../config/db.js";
import { CONFLICT, NOT_FOUND, OK, UNAUTHORIZED } from "../constants/http.js";
import {
  emailSchema,
  idSchema,
  loginSchema,
  registerSchemas,
  resetPasswordValidSchemas,
} from "../schemas/auth-schema.js";
import {
  emailVerify,
  forgotPassword,
  loginUser,
  refreshAcessToken,
  registerUser,
  resetPassword,
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

export const emailVerification = catchError(async (req, res) => {
  const validData = idSchema.parse(req.params.code);
  AppAssert(validData, NOT_FOUND, "Verify code is not provided!");

  await emailVerify(validData);

  return res.status(OK).json({ message: "Email is verified" });
});

export const forgotPasswordHandler = catchError(async (req, res) => {
  const validData = emailSchema.parse(req.body.email);
  AppAssert(validData, NOT_FOUND, "Email is not provided!");

  const { url, emailId } = await forgotPassword(validData);

  return res.status(OK).json({ url, emailId });
});

export const resetPasswordHandler = catchError(async (req, res) => {
  const request = resetPasswordValidSchemas.parse(req.body);
  const { verificationCode, password } = request;

  await resetPassword({ verificationCode, password });

  return setClearCookie(res)
    .status(OK)
    .json({ message: "Password reset successfully!" });
});
