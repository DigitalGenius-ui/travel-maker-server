import express from "express";
import {
  emailVerification,
  forgotPasswordHandler,
  loginHandler,
  logOutHandler,
  refreshTokenHandler,
  registerHandler,
  resetPasswordHandler,
  verifyCodeHandler,
} from "../controllers/auth-controllers.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/register").post(registerHandler);
router.route("/login").post(loginHandler);
router.route("/refresh").get(refreshTokenHandler);
router.route("/email/verify/:code").get(emailVerification);
router.route("/forgot/password").post(forgotPasswordHandler);
router.route("/reset/password").post(resetPasswordHandler);

router.route("/logout").post(authMiddleware, logOutHandler);
router.route("/send/verifyCode").post(authMiddleware, verifyCodeHandler);

export default router;
