import express from "express";
import {
  getProfileDetails,
  updateProfileDetails,
} from "../../actions/user/profile/profile.js";

const router = express.Router();

router.route("/:id").get(getProfileDetails);
router.route("/:id").post(updateProfileDetails);

export default router;
