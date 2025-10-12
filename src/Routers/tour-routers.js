import express from "express";
import {
	createTourReviewHandler,
	removeTourReviewHandler,
	saveTickettHandler,
	singleTourDataHandler,
	tourDataHandler,
	tourPaymentHandler,
	uploadImagesHandler,
} from "../controllers/tours-controllers.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// protected routes
router.route("/createReview").post(authMiddleware, createTourReviewHandler);
router.route("/removeReview/:id").post(authMiddleware, removeTourReviewHandler);
router.route("/ticketSave").post(authMiddleware, saveTickettHandler);

router.route("/").get(tourDataHandler);
router.route("/:tourId").get(singleTourDataHandler);
router.route("/create-checkout-session").post(tourPaymentHandler);
router.route("/uploadImages").post(uploadImagesHandler);

export default router;
