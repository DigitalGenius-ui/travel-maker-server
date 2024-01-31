import jwt from "jsonwebtoken";

export const getAccessToken = (user) => {
  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.ACCESS_SECRET,
    {
      expiresIn: "35s",
    }
  );
  return token;
};

// generate a new refresh token when the access token is expired
export const getRefreshToken = (user) => {
  const refreshToken = jwt.sign(
    { id: user.id, role: user.role },
    process.env.REFRESH_SECRET,
    { expiresIn: "1d" }
  );

  return refreshToken;
};
