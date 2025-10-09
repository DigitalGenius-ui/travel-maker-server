import express from "express";
import {
	getInsightHandler,
	getRevenueAndTopDisHandler,
} from "../controllers/dashboard-controllers.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/insight").get(authMiddleware, getInsightHandler);
router.route("/revenueAndTopDis").get(getRevenueAndTopDisHandler);

export default router;
