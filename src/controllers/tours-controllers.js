import catchError from "../utils/catchError.js";
import { CONFLICT, CREATED, OK } from "../constants/http.js";
import {
  getAllTours,
  removeTourReviews,
  tourBookPayment,
  tourReviews,
  uploadImages,
} from "../services/tours-services.js";
import Stripe from "stripe";
import { STRIP_API_KEY } from "../constants/env.js";
import AppAssert from "../utils/Appassert.js";
import { createTourSchema } from "../schemas/tourSchemas.js";

// get all tours data
export const tourDataHandler = catchError(async (req, res) => {
  const getTours = await getAllTours();

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
  const id = req.userId;

  await removeTourReviews(id);

  return res.status(OK).json({ message: "Review has been removed!" });
});

// book tour payment
export const tourPaymentHandler = catchError(async (req, res) => {
  const { formItems } = req.body;
  const stripe = Stripe(STRIP_API_KEY());

  const { url } = await tourBookPayment(formItems, stripe);

  return res.status(CREATED).json(url);
});

// save ticket to the database
export const saveTickettHandler = catchError(async (req, res) => {
  const data = req.body;
  const userId = req.userId;
  AppAssert(data, CONFLICT, "Ticket data is not provided!");
  await saveTicket(data, userId);

  return res.status(CREATED).json({ message: "Ticket is created." });
});

// upload image
export const uploadImagettHandler = catchError(async (req, res) => {
  const images = req.body;
  AppAssert(images, CONFLICT, "Images are not provided!");
  const { uploadPromises } = await uploadImages(images);

  return res.status(OK).json(uploadPromises);
  //   Promise.all(uploadPromises)
  //     .then((results) => {
  //     })
  //     .catch((err) => {
  //       throw new Error(err.message);
  //     });
});
