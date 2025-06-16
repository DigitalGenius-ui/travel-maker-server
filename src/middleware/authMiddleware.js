import { AppErrorCode } from "../constants/AppErrorCode.js";
import { UNAUTHORIZED } from "../constants/http.js";
import AppAssert from "../utils/Appassert.js";
import { verifyToken } from "../utils/JWTToken.js";

export const authMiddleware = (req, res, next) => {
  const accessToken = req.cookies.accessToken;
  AppAssert(
    accessToken,
    UNAUTHORIZED,
    "Access token is not found",
    AppErrorCode.TOKEN_NOT_FOUND
  );

  // TODO: must fix the verifyToken erro if the token is invalid

  const { payload, error } = verifyToken(accessToken, "accessToken");

  AppAssert(
    !error,
    UNAUTHORIZED,
    "Access token is invalid!",
    AppErrorCode.INVALID_TOKEN
  );

  req.userId = payload?.userId;
  req.sessionId = payload?.sessionId;
  req.admin = payload?.admin;

  next();
};
