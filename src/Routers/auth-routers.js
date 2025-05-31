import express from "express";
import {
  emailVerification,
  forgotPasswordHandler,
  loginHandler,
  logOutHandler,
  refreshTokenHandler,
  registerHandler,
  resetPasswordHandler,
} from "../controllers/auth-controllers.js";

const router = express.Router();

router.route("/register").post(registerHandler);
router.route("/login").post(loginHandler);
router.route("/logout").post(logOutHandler);
router.route("/refresh").get(refreshTokenHandler);
router.route("/email/verify/:code").get(emailVerification);
router.route("/forgot/password").post(forgotPasswordHandler);
router.route("/reset/password").post(resetPasswordHandler);

export default router;
