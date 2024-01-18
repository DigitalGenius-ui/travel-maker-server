import express from "express";
import {
  allUsers,
  logOut,
  login,
  refreshToken,
  register,
} from "../../actions/user/userAction.js";

const router = express.Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").post(logOut);
router.route("/refresh-token").post(refreshToken);

router.route("/users").get(allUsers);

export default router;
