import catchError from "../utils/catchError.js";
import {
  CONFLICT,
  CREATED,
  NOT_FOUND,
  OK,
  UNAUTHORIZED,
} from "../constants/http.js";
import {
  getAllTours,
  removeTourReviews,
  saveTicket,
  tourBookPayment,
  tourReviews,
  uploadImages,
} from "../services/tours-services.js";
import Stripe from "stripe";
import { STRIP_API_KEY } from "../constants/env.js";
import AppAssert from "../utils/Appassert.js";
import { createTourSchema } from "../schemas/tourSchemas.js";
import { idSchema } from "../schemas/auth-schema.js";
import { db } from "../config/db.js";

// get all tours data
export const tourDataHandler = catchError(async (req, res) => {
  const getTours = await getAllTours();

  return res.status(OK).json(getTours);
});

// get all tour review
export const getTourReviewHandler = catchError(async (req, res) => {
  const data = createTourSchema.parse(req.body);
  const userId = req.userId;
  const getTours = await tourReviews(data, userId);

  return res.status(OK).json(getTours);
});

// create tour review
export const createTourReviewHandler = catchError(async (req, res) => {
  const data = createTourSchema.parse(req.body);
  const userId = req.userId;
  const getTours = await tourReviews(data, userId);

  return res.status(OK).json(getTours);
});

// remove tour review
export const removeTourReviewHandler = catchError(async (req, res) => {
  const id = idSchema.parse(req.params.id);
  const userId = req.userId;

  await removeTourReviews(id, userId);

  return res.status(OK).json({ message: "Review has been removed!" });
});

// book tour payment
export const tourPaymentHandler = catchError(async (req, res) => {
  const formItems = req.body;
  const stripe = Stripe(STRIP_API_KEY());

  const { url } = await tourBookPayment(formItems, stripe);

  return res.status(CREATED).json(url);
});

// save ticket to the database
export const saveTickettHandler = catchError(async (req, res) => {
  const data = req.body;
  const userId = req.userId;
  AppAssert(data, CONFLICT, "Ticket data is not provided!");

  const { createTicket } = await saveTicket(data, userId);

  return res.status(CREATED).json(createTicket);
});

// upload image
export const uploadImagesHandler = catchError(async (req, res) => {
  const images = req.body;
  AppAssert(images, CONFLICT, "Images are not provided!");
  const { result } = await uploadImages(images);

  Promise.all(result)
    .then((results) => {
      return res.status(CREATED).json(results);
    })
    .catch((err) => {
      throw new Error(err.message);
    });
});
