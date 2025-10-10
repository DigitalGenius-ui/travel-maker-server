import { OK, UNAUTHORIZED } from "../constants/http.js";
import {
	getInsight,
	getRevenueAndTopDis,
	getTripsAndPackage,
} from "../services/dashboard-services.js";
import AppAssert from "../utils/Appassert.js";
import catchError from "../utils/catchError.js";
import { filterSchema } from "../validation_schemas/dashboard_schema.js";

// get insight data
export const getInsightHandler = catchError(async (req, res) => {
	const filter = filterSchema.parse(req.query.filter);
	const isAdmin = req.admin === "ADMIN";

	AppAssert(isAdmin, UNAUTHORIZED, "You are not authorised to access this route!");

	const { bookings, customers, earnings } = await getInsight(filter);

	return res.status(OK).json({ bookings, customers, earnings });
});

// get insight data
export const getRevenueAndTopDisHandler = catchError(async (req, res) => {
	const disFilter = req.query.disFilter;
	const revenueFilter = req.query.revenueFilter;

	const isAdmin = req.admin === "ADMIN";
	AppAssert(isAdmin, UNAUTHORIZED, "You are not authorised to access this route!");

	const { revenue, distinations } = await getRevenueAndTopDis(disFilter, revenueFilter);

	return res.status(OK).json({ revenue, distinations });
});

// get trips and package Hanlder data
export const getTripsAndPackageHanlder = catchError(async (req, res) => {
	// const isAdmin = req.admin === "ADMIN";
	// AppAssert(isAdmin, UNAUTHORIZED, "You are not authorised to access this route!");

	const { trips, totalTrips } = await getTripsAndPackage();

	return res.status(OK).json({ trips, totalTrips });
});
