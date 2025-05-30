import { db } from "../config/db.js";
import { CONFLICT, UNAUTHORIZED } from "../constants/http.js";
import { verificationCodeType } from "../constants/verificationCodeType.js";
import AppAssert from "../utils/Appassert.js";
import { comparePass, hashPassword } from "../utils/bcrypt.js";
import { generateToken, verifyToken } from "../utils/JWTToken.js";
import {
  ONE_DAY_MS,
  oneYearFromNow,
  thirtyDaysFromNow,
} from "../utils/date.js";

export const registerUser = async (inputs) => {
  const { email, password, userAgent } = inputs;
  const userExisting = await db.user.findUnique({
    where: { email },
  });

  AppAssert(!userExisting, CONFLICT, "This email is already taken.");

  const newPassword = await hashPassword(password);

  const createdUser = await db.user.create({
    data: {
      email,
      password: newPassword,
      userAgent,
    },
  });

  //   create verification code for email
  const createVerificatioCode = await db.verificationCode.create({
    data: {
      userId: createdUser.id,
      type: verificationCodeType.email,
      expiresAt: oneYearFromNow(),
    },
  });

  //   create session
  const createSession = await db.sessionModelCode.create({
    data: {
      userId: createdUser.id,
      userAgent: inputs.userAgent,
      expiresAt: thirtyDaysFromNow(),
    },
  });

  // create refresh token
  const refreshToken = generateToken({
    payload: { sessionId: createSession.id },
    type: "refreshToken",
  });

  //   // create access token
  const accessToken = generateToken({
    payload: { userId: createdUser.id, sessionId: createSession.id },
    type: "accessToken",
  });

  const { password: pass, ...rest } = createdUser;

  return {
    user: rest,
    accessToken,
    refreshToken,
  };
};

export const loginUser = async (inputs) => {
  const { email, password, userAgent } = inputs;
  const userExist = await db.user.findUnique({
    where: { email },
  });

  AppAssert(userExist, UNAUTHORIZED, "This email is not exist!");

  const passwordMatching = await comparePass(password, userExist.password);
  AppAssert(passwordMatching, UNAUTHORIZED, "Wrong password!!");

  const { id } = userExist;

  // create session
  const session = await db.sessionModelCode.create({
    data: {
      userId: id,
      userAgent,
      expiresAt: thirtyDaysFromNow(),
    },
  });

  // create refresh token
  const refreshToken = generateToken({
    payload: { sessionId: session.id },
    type: "refreshToken",
  });

  // create access token
  const accessToken = generateToken({
    payload: {
      userId: id,
      sessionId: session.id,
    },
    type: "accessToken",
  });

  return {
    user: userExist,
    accessToken,
    refreshToken,
  };
};

export const refreshAcessToken = async (refreshToken) => {
  const { payload, error } = verifyToken(refreshToken, "refreshToken");
  AppAssert(!error, UNAUTHORIZED, "User is not authorized!");

  // find session
  const sessionExists = await db.sessionModelCode.findFirst({
    where: { id: payload.sessionId },
  });

  const sessionExpireAt = sessionExists.expiresAt;
  const now = Date.now();
  // check if the expires time is greater then now
  AppAssert(
    sessionExists && sessionExpireAt.getTime() > now,
    UNAUTHORIZED,
    "Session is expired!"
  );
  // check if the token is expiring in the next 24 hours.
  const isSessionExpiringSoon = sessionExpireAt.getTime() - now <= ONE_DAY_MS;
  if (isSessionExpiringSoon) {
    await sessionExists.update({ expiresAt: thirtyDaysFromNow() });
  }
  // regenerate refresh and access tokens
  const newRefreshToken = isSessionExpiringSoon
    ? generateToken({
        payload: { sessionId: sessionExists.id },
        type: "refreshToken",
      })
    : undefined;

  const accessToken = generateToken({
    payload: {
      user_id: sessionExists.userId,
      sessionId: sessionExists.id,
    },
    type: "accessToken",
  });

  // return access and refresh tokens
  return {
    accessToken,
    newRefreshToken,
  };
};
