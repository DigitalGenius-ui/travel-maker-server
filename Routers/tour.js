import express from "express";
import { tourData } from "../actions/Tour.js";

const router = express.Router();

router.get("/", tourData);

export default router;
