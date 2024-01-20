import express from "express";
import {
  getProfileDetails,
  updateProfileDetails,
} from "../../actions/user/profile/profile.js";

const router = express.Router();

router.route("/:userId").get(getProfileDetails);
router.route("/").post(updateProfileDetails);

export default router;
