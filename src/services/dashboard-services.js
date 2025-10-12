import { db } from "../config/db.js";
import AppAssert from "../utils/Appassert.js";
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
} from "../utils/formatChartData.js";

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

// get insight data
export const getInsight = async filter => {
	// bookings data
	const [bookings, prevBookings] = await Promise.all([
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
		db.bookings.findMany({
			where: {
				createAt: {
					gte: filterBased[filter],
					lt: filterPrevBased[filter],
				},
			},
			select: { totalPrice: true },
		}),
	]);
	AppAssert(bookings, 500, "Error in fetching bookings data");
	AppAssert(prevBookings, 500, "Error in fetching prev bookings data");

	// get users data
	const [users, prevUsers] = await Promise.all([
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
			totalBookings: bookings.length,
			bookingsTime,
			...calcChartGrowth(bookings.length, prevBookings.length),
		},
		customers: {
			totalCustomer: users.length,
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

// get revenue data
export const getRevenue = async revenueFilter => {
	const revenueBook = await db.bookings.findMany({
		where: {
			createAt: {
				gte: filterBased[revenueFilter],
			},
		},
		select: {
			title: true,
			totalPrice: true,
			createAt: true,
		},
	});

	// format all the data
	const earningsFormate = formatChartData(revenueBook, "totalPrice", revenueFilter);
	const earningsTime = fillMissingChartDate(revenueFilter, earningsFormate);

	return {
		revenue: earningsTime,
	};
};

// get top destinations data
export const getTopDis = async disFilter => {
	const disBook = await db.bookings.findMany({
		where: {
			createAt: {
				gte: filterBased[disFilter],
			},
		},
		select: {
			title: true,
			createAt: true,
		},
	});

	// top distications
	const distinations = new Map();

	for (const b of disBook) {
		distinations.set(b.title, (distinations.get(b.title) || 0) + 1);
	}

	// getting top distinations
	const topDis = [];
	for (const [key, value] of distinations) {
		if (topDis.length < 4) {
			topDis.push({ title: key, count: value });
		} else {
			let minIndex = 0;
			for (let i = 1; i < 4; i++) {
				if (topDis[i].count < topDis[minIndex].count) minIndex = i;
			}

			if (value > topDis[minIndex].count) {
				topDis[minIndex] = { title: key, count: value };
			}
		}
	}

	return {
		distinations: topDis,
	};
};

// get booking and package handler
export const getTripsAndPackage = async () => {
	// bookings lengths
	const [trips] = await Promise.all([
		await db.bookings.findMany({
			select: {
				status: true,
			},
			orderBy: { status: "desc" },
		}),
	]);

	const statusCounts = trips.reduce((acc, { status }) => {
		acc[status] = (acc[status] || 0) + 1;
		return acc;
	}, {});

	const newTrips = [
		{ title: "Canceled", amount: statusCounts.canceled ?? 0 },
		{ title: "Pending", amount: statusCounts.pending ?? 0 },
		{ title: "Done", amount: statusCounts.verified ?? 0 },
	];

	return {
		trips: newTrips,
		totalTrips: trips.length,
	};
};
