import express from "express";
import {
  logOut,
  login,
  refreshToken,
  register,
} from "../../actions/user/auth/userAction.js";

const router = express.Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").post(logOut);
router.route("/refreshToken").get(refreshToken);

export default router;
