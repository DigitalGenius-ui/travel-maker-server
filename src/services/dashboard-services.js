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

// get revenue and top destinations
export const getRevenueAndTopDis = async (disFilter, revenueFilter) => {
	// Current and Previous period data for drop comparison
	const [disBook, revenueBook] = await Promise.all([
		await db.bookings.findMany({
			where: {
				createAt: {
					gte: filterBased[disFilter],
				},
			},
			select: {
				title: true,
				createAt: true,
			},
		}),
		await db.bookings.findMany({
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
		}),
	]);

	// format all the data
	const earningsFormate = formatChartData(revenueBook, "totalPrice", revenueFilter);
	const earningsTime = fillMissingChartDate(revenueFilter, earningsFormate);

	// top distications
	const distinations = [];

	disBook.forEach(b => {
		const existing = distinations.find(r => r.title === b.title);
		if (existing) existing.count++;
		else distinations.push({ title: b.title, count: 1 });
	});

	const topDis = distinations.sort((a, b) => a.count + b.count).slice(0, 4);

	return {
		revenue: {
			earningsTime,
		},
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

	// total trips
	const totalTrips = Object.values(statusCounts).reduce((acc, item) => (acc += item), 0);

	return {
		trips: newTrips,
		totalTrips: totalTrips,
	};
};
