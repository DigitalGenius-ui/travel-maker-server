import express from "express";
import {
  singleTour,
  tourBookPayment,
  tourData,
  tourReviews,
} from "../../actions/tours/toursAction.js";

const router = express.Router();

router.route("/").get(tourData);
router.route("/:id").get(singleTour);
router.route("/createReview").post(tourReviews);
router.route("/create-checkout-session").post(tourBookPayment);

export default router;
