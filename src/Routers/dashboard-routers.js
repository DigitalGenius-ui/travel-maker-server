import express from "express";
import {
	getInsightHandler,
	getRevenueAndTopDisHandler,
	getTripsAndPackageHanlder,
} from "../controllers/dashboard-controllers.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/insight").get(authMiddleware, getInsightHandler);
router.route("/revenueAndTopDis").get(authMiddleware, getRevenueAndTopDisHandler);
router.route("/tripsAndPackages").get(getTripsAndPackageHanlder);

export default router;
