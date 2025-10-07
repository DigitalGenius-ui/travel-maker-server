import express from "express";
import { getInsightHandler } from "../controllers/dashboard-controllers.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/insight").get(getInsightHandler, authMiddleware);

export default router;
