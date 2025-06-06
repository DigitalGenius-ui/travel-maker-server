import express from "express";
import {
  changePasswordHandler,
  createMomentCommentPostHandler,
  createMomentHandler,
  getAllMomentPostHandler,
  getCurrentUserHandler,
  getSingleMomentPostHandler,
  getSingleUserHandler,
  removeMomentCommentHandler,
  removeMomentHandler,
  updateImageHandler,
  updateProfileDetailsHandler,
} from "../controllers/user-controllers.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// user data
router.route("/").get(authMiddleware, getCurrentUserHandler);
router.route("/:id").get(getSingleUserHandler);
router.route("/profile").post(authMiddleware, updateProfileDetailsHandler);
router.route("/uploadImage").post(authMiddleware, updateImageHandler);

// moment api
router.route("/createPost").post(authMiddleware, createMomentHandler);
router.route("/singleMoment/:id").get(getSingleMomentPostHandler);
router.route("/allMoments").get(getAllMomentPostHandler);
router.route("/removePost/:id").delete(authMiddleware, removeMomentHandler);
router
  .route("/createComment")
  .post(authMiddleware, createMomentCommentPostHandler);
router
  .route("/removeComment/:id")
  .delete(authMiddleware, removeMomentCommentHandler);

// change profile password
router.route("/changePassword/:id").put(authMiddleware, changePasswordHandler);

export default router;
