import express from "express";
import {
  loginHandler,
  logOutHandler,
  refreshTokenHandler,
  registerHandler,
} from "../controllers/auth-controllers.js";

const router = express.Router();

router.route("/register").post(registerHandler);
router.route("/login").post(loginHandler);
router.route("/logout").post(logOutHandler);
router.route("/refresh").get(refreshTokenHandler);

export default router;
