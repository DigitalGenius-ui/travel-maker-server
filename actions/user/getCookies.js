import { getAccessToken } from "./generateToken.js";

export const getCookies = (user, res) => {
  const accessToken = getAccessToken(user);

  const option = {
    expiresIn: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };

  user.password = undefined;

  res
    .status(200)
    .cookie("accessToken", accessToken, option)
    .json({ status: "SUCCESS", accessToken, user });
};
