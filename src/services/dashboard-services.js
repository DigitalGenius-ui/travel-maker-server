import { db } from "../config/db.js";
import {
	oneMonth,
	oneMonthEgo,
	oneWeek,
	oneWeekEgo,
	oneYear,
	oneYearEgo,
} from "../utils/date.js";
import {
	calcChartGrowth,
	fillMissingChartDate,
	formatChartData,
} from "../utils/formatInsightData.js";

// get dash insight
const filterBased = {
	weekly: oneWeek(),
	monthly: oneMonth(),
	yearly: oneYear(),
};

const filterPrevBased = {
	weekly: oneWeekEgo(),
	monthly: oneMonthEgo(),
	yearly: oneYearEgo(),
};

export const getInsight = async filter => {
	// bookings data
	const [bookings, totalBookings] = await Promise.all([
		await db.bookings.findMany({
			where: {
				createAt: {
					gte: filterBased[filter],
				},
			},
			select: {
				totalPrice: true,
				createAt: true,
			},
		}),
		await db.bookings.count({
			where: {
				createAt: {
					gte: filterBased[filter],
				},
			},
		}),
	]);

	// get customers data
	const [users, totalUsers] = await Promise.all([
		await db.user.findMany({
			where: {
				createAt: {
					gte: filterBased[filter],
				},
			},
			select: {
				id: true,
				createAt: true,
			},
		}),
		await db.user.count({
			where: {
				createAt: {
					gte: filterBased[filter],
				},
			},
		}),
	]);

	// Previous period data for drop comparison
	const [prevBookings, prevUsers] = await Promise.all([
		db.bookings.findMany({
			where: {
				createAt: {
					gte: filterBased[filter],
					lt: filterPrevBased[filter],
				},
			},
			select: { totalPrice: true },
		}),
		db.user.findMany({
			where: {
				createAt: {
					gte: filterBased[filter],
					lt: filterPrevBased[filter],
				},
			},
			select: { id: true },
		}),
	]);

	// Earnings
	const totalEarnings = bookings.reduce((acc, item) => (acc += +item.totalPrice), 0);
	const prevEarnings = prevBookings.reduce((acc, item) => acc + +item.totalPrice, 0);

	// format all the data
	const earningsFormate = formatChartData(bookings, "totalPrice", filter);
	const bookingFormate = formatChartData(bookings, null, filter);
	const customerFormate = formatChartData(users, null, filter);

	// filling the missing dates
	const earningsTime = fillMissingChartDate(filter, earningsFormate);
	const bookingsTime = fillMissingChartDate(filter, bookingFormate);
	const customerTime = fillMissingChartDate(filter, customerFormate);

	return {
		bookings: {
			totalBookings,
			bookingsTime,
			...calcChartGrowth(bookings.length, prevBookings.length),
		},
		customers: {
			totalCustomer: totalUsers,
			customerTime,
			...calcChartGrowth(users.length, prevUsers.length),
		},
		earnings: {
			totalEarnings,
			earningsTime,
			...calcChartGrowth(totalEarnings, prevEarnings),
		},
	};
};
