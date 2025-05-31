import express from "express";
import {
  getSingleUserHandler,
  updateImageHandler,
  updateProfileDetailsHandler,
} from "../controllers/user-controllers.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// user data
router.route("/").get(authMiddleware, getSingleUserHandler);
router.route("/profile").post(authMiddleware, updateProfileDetailsHandler);
router.route("/uploadImage").post(authMiddleware, updateImageHandler);

// moment api
// router.route("/createPost").post(createMomentPost);
// router.route("/singleMoment/:id").get(getSingleMomentPost);
// router.route("/removePost/:id").delete(removeMomentPost);
// router.route("/allMoments").get(getAllMomentPosts);
// router.route("/createComment").post(createMomentComment);
// router.route("/removeComment/:id").delete(removeMomentComment);

// change profile password
// router.route("/changePassword/:id").put(changeUserPassword);

export default router;
