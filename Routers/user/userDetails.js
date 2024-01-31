import express from "express";
import {
  getUserDetailsServer,
  removeMomentPost,
  updateProfileDetails,
  createMomentPost,
  getSingleMomentPost,
  getAllMomentPosts,
  createMomentComment,
  removeMomentComment,
  changeUserPassword,
} from "../../actions/user/user/userDetailsServer.js";
import { verifyToken } from "../../actions/user/auth/verifyToken.js";

const router = express.Router();

router.route("/:id").get(verifyToken, getUserDetailsServer);

router.route("/profile").post(updateProfileDetails);

// moment api
router.route("/createPost").post(createMomentPost);
router.route("/singleMoment/:id").get(getSingleMomentPost);
router.route("/removePost/:id").delete(removeMomentPost);
router.route("/allMoments").get(getAllMomentPosts);
router.route("/createComment").post(createMomentComment);
router.route("/removeComment/:id").delete(removeMomentComment);

// change profile password
router.route("/changePassword/:id").put(changeUserPassword);

export default router;
