import express from "express";
import { userDetails } from "../../actions/user/userDetails/userDetails.js";

const router = express.Router();

router.route("/:id").get(userDetails);

export default router;
