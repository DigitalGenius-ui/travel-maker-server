import jwt from "jsonwebtoken";

export const getAccessToken = (user) => {
  const token = jwt.sign({ userId: user.id }, process.env.ACCESS_SECRET, {
    expiresIn: "10m",
  });
  return token;
};

// generate a new refresh token the access token is expired
// export const generateRefreshToken = (req, res) => {
//   try {
//     const refreshToken = req.cookies.refreshToken;

//     //   verify refresh token
//     const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
//     if (!decoded) {
//       res
//         .status(404)
//         .json({ status: "SUCCESS", message: "No refresh token exist." });
//     }

//     //   update the access token
//     const accessToken = jwt.sign(decoded, process.env.ACCESS_SECRET);

//     res
//       .json({ status: "SUCCESS", accessToken })
//       .cookie("accessToken", accessToken, {
//         httpOnly: true,
//         expiresIn: "15 m",
//       });
//   } catch (error) {
//     throw new Error(error.message);
//   }
// };
