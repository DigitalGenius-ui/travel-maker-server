import { OK, UNAUTHORIZED } from "../constants/http.js";
import { getInsight, getRevenueAndTopDis } from "../services/dashboard-services.js";
import AppAssert from "../utils/Appassert.js";
import catchError from "../utils/catchError.js";

// get insight data
export const getInsightHandler = catchError(async (req, res) => {
	const filter = req.query.filter;
	const isAdmin = req.admin === "ADMIN";

	AppAssert(isAdmin, UNAUTHORIZED, "You are not authorised to access this route!");

	const { bookings, customers, earnings } = await getInsight(filter);

	return res.status(OK).json({ bookings, customers, earnings });
});

// get insight data
export const getRevenueAndTopDisHandler = catchError(async (req, res) => {
	const filter = req.query.filter;
	// const isAdmin = req.admin === "ADMIN";

	// AppAssert(isAdmin, UNAUTHORIZED, "You are not authorised to access this route!");

	const { revenue, distinations, allBookings } = await getRevenueAndTopDis(filter);

	return res.status(OK).json({ revenue, distinations, allBookings });
});
