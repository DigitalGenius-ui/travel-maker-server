import express from "express";
import { singleTour, tourData } from "../../actions/tours/toursAction.js";

const router = express.Router();

router.route("/").get(tourData);
router.route("/:id").get(singleTour);

export default router;
