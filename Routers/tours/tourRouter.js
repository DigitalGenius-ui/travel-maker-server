import express from "express";
import {
  singleTour,
  tourData,
  tourReviews,
} from "../../actions/tours/toursAction.js";

const router = express.Router();

router.route("/").get(tourData);
router.route("/:id").get(singleTour);
router.route("/createReview").post(tourReviews);

export default router;
