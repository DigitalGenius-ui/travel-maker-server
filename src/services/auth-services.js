import { db } from "../config/db.js";
import {
  CONFLICT,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  TOO_MANY_REQUESTS,
  UNAUTHORIZED,
} from "../constants/http.js";
import { verificationCodeType } from "../constants/verificationCodeType.js";
import AppAssert from "../utils/Appassert.js";
import { comparePass, hashPassword } from "../utils/bcrypt.js";
import { generateToken, verifyToken } from "../utils/JWTToken.js";
import {
  fiveMinutesAgo,
  ONE_DAY_MS,
  oneHoureFromNow,
  oneYearFromNow,
  thirtyDaysFromNow,
} from "../utils/date.js";
import { CLIENT_URL } from "../constants/env.js";
import { sendEmail } from "../utils/sendEmail.js";
import {
  getPasswordResetTemplate,
  getVerifyEmailTemplate,
} from "../utils/emailTemplate.js";

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
  await verifyEmailCode({ userId: createdUser.id, email: createdUser.email });

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

export const verifyEmailCode = async ({ userId, email }) => {
  const verfiyCode = await db.verificationCode.create({
    data: {
      userId: userId,
      type: verificationCodeType.email,
      expiresAt: oneYearFromNow(),
    },
  });

  AppAssert(verfiyCode, INTERNAL_SERVER_ERROR, "Failed to create verify code!");

  const url = `${CLIENT_URL()}/email/verify/${verfiyCode.id}`;
  const { error } = await sendEmail({
    to: email,
    ...getVerifyEmailTemplate(url),
  });

  if (error) {
    console.log(error);
  }
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
      userId: sessionExists.userId,
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

export const emailVerify = async (code) => {
  const verifyCode = await db.verificationCode.findFirst({
    where: { id: code },
  });
  AppAssert(verifyCode, NOT_FOUND, "Verify code is expired!!");

  const user = await db.user.findFirst({ where: { id: verifyCode.userId } });
  AppAssert(user, NOT_FOUND, "User is not exist!");

  const updateUser = await db.user.update({
    where: { id: user.id },
    data: { verified: true },
  });
  AppAssert(updateUser, CONFLICT, "Failed to update the user.");

  const removeCode = await db.verificationCode.delete({
    where: { id: verifyCode.id },
  });
  AppAssert(removeCode, CONFLICT, "No record is found to be removed!");

  const { password, ...userData } = user;
  return { user: userData };
};

export const forgotPassword = async (email) => {
  const user = await db.user.findFirst({ where: { email } });
  AppAssert(user, NOT_FOUND, "User is not exist!");

  // email request limit
  await emailCodeLimit({ userId: user.id, type: verificationCodeType.email });

  const expiresAt = oneHoureFromNow();
  const newVerifyCode = await db.verificationCode.create({
    data: {
      userId: user.id,
      type: verificationCodeType.password,
      expiresAt,
    },
  });

  // send email with verification code
  const url = `${CLIENT_URL()}/auth/password/reset?code=${
    newVerifyCode.id
  }&exp=${expiresAt.getTime()}`;

  const { data, error } = await sendEmail({
    to: user.email,
    ...getPasswordResetTemplate(url),
  });

  AppAssert(
    data?.id,
    INTERNAL_SERVER_ERROR,
    `${error?.name} - ${error?.message}`
  );

  // return success message
  return {
    url,
    emailId: data?.id,
  };
};

export const resetPassword = async ({ verificationCode, password }) => {
  // get verification code
  const code = await db.verificationCode.findFirst({
    where: { id: verificationCode },
  });
  AppAssert(code, CONFLICT, "Verification code is not valid!");
  // change the password
  const user = await db.user.findFirst({
    where: { id: code.userId },
  });
  AppAssert(user, NOT_FOUND, "User is not exists!");

  const updatePassword = await db.user.update({
    where: { id: user.id },
    data: { password: await hashPassword(password) },
  });
  AppAssert(
    updatePassword,
    INTERNAL_SERVER_ERROR,
    "Failed to update password!"
  );
  // delete the verification code

  await db.verificationCode.delete({ where: { id: verificationCode } });
  // delete all sessions
  const sessionModel = await db.sessionModelCode.findFirst({
    where: { id: verificationCode },
  });
  if (sessionModel) {
    await db.sessionModelCode.delete({ where: { userId: user.id } });
  }
  // return success message
  return {
    message: "Password has been reset successfully! Please login again.",
  };
};

export const emailCodeLimit = async ({ userId, type }) => {
  const reqLimit = await db.verificationCode.count({
    where: {
      userId: userId,
      type,
      createAt: {
        gt: fiveMinutesAgo(),
      },
    },
  });

  AppAssert(
    reqLimit <= 2,
    TOO_MANY_REQUESTS,
    "Too many requests, Please try again later!"
  );
};
