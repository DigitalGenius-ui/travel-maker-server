import { NODE_ENV } from "../constants/env.js";
import { fifteenMinutesFromNow, thirtyDaysFromNow } from "./date.js";

const defaults = {
  httpOnly: true,
  secure: NODE_ENV() !== "development",
  sameSite: "strict",
};

export const getAccessTokenCookieOptions = () => ({
  ...defaults,
  expires: fifteenMinutesFromNow(),
});

export const REFRESH_PATH = "api/auth/refresh";

export const getRefreshTokenCookieOptions = () => ({
  ...defaults,
  expires: thirtyDaysFromNow(),
  // we want this cookie to be available only in refresh token route.
  path: REFRESH_PATH,
});

export const setAccessToken = ({ res, accessToken, refreshToken }) => {
  return res
    .cookie("accessToken", accessToken, getAccessTokenCookieOptions())
    .cookie("refreshToken", refreshToken, getRefreshTokenCookieOptions());
};

export const setClearCookie = (res) => {
  return res
    .clearCookie("accessToken")
    .clearCookie("resfeshToken", { path: REFRESH_PATH });
};
