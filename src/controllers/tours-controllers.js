import catchError from "../utils/catchError.js";
import { CONFLICT, CREATED, OK } from "../constants/http.js";
import {
	getAllTours,
	removeTourReviews,
	saveTicket,
	singleTour,
	tourBookPayment,
	tourReviews,
	uploadImages,
} from "../services/tours-services.js";
import Stripe from "stripe";
import { STRIP_API_KEY } from "../constants/env.js";
import AppAssert from "../utils/Appassert.js";
import { createTourSchema } from "../validation_schemas/tourSchemas.js";
import { idSchema } from "../validation_schemas/auth-schema.js";

// get all tours data
export const tourDataHandler = catchError(async (req, res) => {
	const limit = req.query.limit;
	const page = req.query.page;
	const cat = req.query.cat;
	const { allTours, totalPages } = await getAllTours(limit, page, cat);

	return res.status(OK).json({ allTours, totalPages });
});

// get all tours data
export const singleTourDataHandler = catchError(async (req, res) => {
	const tourId = idSchema.parse(req.params.tourId);
	const getSingleTours = await singleTour(tourId);

	return res.status(OK).json(getSingleTours);
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
		.then(results => {
			return res.status(CREATED).json(results);
		})
		.catch(err => {
			throw new Error(err.message);
		});
});
