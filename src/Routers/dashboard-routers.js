import express from "express";
import {
	getInsightHandler,
	getRevenueHandler,
	getTopDisHandler,
	getTripsAndPackageHanlder,
} from "../controllers/dashboard-controllers.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/insight").get(authMiddleware, getInsightHandler);
router.route("/chartRevenue").get(authMiddleware, getRevenueHandler);
router.route("/chartTopDis").get(authMiddleware, getTopDisHandler);
router.route("/tripsAndPackages").get(authMiddleware, getTripsAndPackageHanlder);

export default router;
