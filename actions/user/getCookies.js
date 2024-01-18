import { generateRefreshToken, getAccessToken } from "./generateToken.js";

export const getCookies = async (user, res) => {
  const accessToken = getAccessToken(user);
  const refreshToken = await generateRefreshToken(user);

  const option = {
    expiresIn: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };

  user.password = undefined;

  res.cookie("refreshToken", refreshToken, option);

  return res.status(200).json({ status: "SUCCESS", accessToken, user });
};
