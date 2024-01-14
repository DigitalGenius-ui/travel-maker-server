import express from "express";
import {
  allUsers,
  logOut,
  login,
  register,
} from "../../actions/user/userAction.js";
import { verifyToken } from "../../actions/user/verifyToken.js";

const router = express.Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").post(logOut);
// router.route("/refresh-token").post(generateRefreshToken);

router.route("/users").get(verifyToken, allUsers);

export default router;
