import express from "express";
import {
  removeTourReviews,
  saveTicket,
  singleTour,
  tourBookPayment,
  tourData,
  tourReviews,
  uploadImages,
} from "../../services/tours/toursAction.js";

const router = express.Router();

router.route("/").get(tourData);
router.route("/:id").get(singleTour);
router.route("/createReview").post(tourReviews);
router.route("/removeReview/:id").post(removeTourReviews);
router.route("/uploadImages").post(uploadImages);
router.route("/create-checkout-session").post(tourBookPayment);
router.route("/ticketSave").post(saveTicket);

export default router;
