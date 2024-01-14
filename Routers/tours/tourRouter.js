import express from "express";
import { tourData } from "../../actions/tours/toursAction.js";

const router = express.Router();

router.route("/").get(tourData);

export default router;
