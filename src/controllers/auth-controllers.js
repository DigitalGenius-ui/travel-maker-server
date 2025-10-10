import { db } from "../config/db.js";
import { AppErrorCode } from "../constants/AppErrorCode.js";
import { CONFLICT, NOT_FOUND, OK, UNAUTHORIZED } from "../constants/http.js";
import { verificationCodeType } from "../constants/verificationCodeType.js";
import {
	emailSchema,
	idSchema,
	loginSchema,
	registerSchemas,
	resetPasswordValidSchemas,
} from "../validation_schemas/auth-schema.js";
import {
	emailCodeLimit,
	emailVerify,
	forgotPassword,
	loginUser,
	refreshAcessToken,
	registerUser,
	resetPassword,
	verifyEmailCode,
} from "../services/auth-services.js";
import AppAssert from "../utils/Appassert.js";
import catchError from "../utils/catchError.js";
import {
	getAccessTokenCookieOptions,
	getRefreshTokenCookieOptions,
	setAccessToken,
	setClearCookie,
} from "../utils/cookie.js";

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

export const verifyCodeHandler = catchError(async (req, res) => {
	const userId = req.userId;

	const user = await db.user.findFirst({ where: { id: userId } });
	AppAssert(user, UNAUTHORIZED, "User is not authorized!");

	// email request limit
	await emailCodeLimit({ userId: user.id, type: verificationCodeType.email });

	await verifyEmailCode({ userId, email: user.email });

	return res
		.status(OK)
		.json({ message: "Verification code has been sent to you email." });
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
	const sessionId = req.sessionId;
	AppAssert(
		sessionId,
		UNAUTHORIZED,
		"SessionId is not provided!",
		AppErrorCode.SESSION_NOT_EXIST
	);

	// remove session
	await db.sessionModelCode.delete({ where: { id: sessionId } });

	return setClearCookie(res).status(OK).json({ message: "User is logged out!" });
});

export const refreshTokenHandler = catchError(async (req, res) => {
	const isRefreshToken = req.cookies.refreshToken;
	AppAssert(isRefreshToken, UNAUTHORIZED, "Token is not provided!");

	const { accessToken, refreshToken } = await refreshAcessToken(isRefreshToken);

	if (refreshToken) {
		return res.cookie("refreshToken", refreshToken, getRefreshTokenCookieOptions());
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

	return setClearCookie(res).status(OK).json({ message: "Password reset successfully!" });
});
