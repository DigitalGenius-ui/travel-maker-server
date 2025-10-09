import dayjs from "dayjs";

const timeFormat = {
	weekly: "ddd DD, MMM",
	monthly: "MMM DD, YYYY",
	yearly: "MMM, YYYY",
};

// return value formatter
export const formatChartData = (data, dataItem = null, filter) => {
	const sumData = data.reduce((acc, item) => {
		const day = dayjs(item.createAt.toISOString().split("T")[0]).format(
			timeFormat[filter]
		);
		acc[day] = (acc[day] || 0) + (dataItem ? +item[dataItem] : 1);
		return acc;
	}, {});

	const formatData = Object.entries(sumData).map(([key, value]) => {
		return {
			name: key,
			value,
		};
	});
	return formatData;
};

// drop and rise calc
export const calcChartGrowth = (current, previous) => {
	const percentageChange = ((current - previous) / Math.abs(previous || 1)) * 100;
	const percent = Math.max(-100, Math.min(percentageChange, 100));

	return {
		percent: Math.abs(+percent),
	};
};

// adding full week, month and year.
export const fillMissingChartDate = (filter, data) => {
	const map = new Map(data.map(d => [d.name, d.value]));
	const filled = [];

	const now = dayjs();

	if (filter === "weekly") {
		for (let i = 6; i >= 0; i--) {
			const date = now.subtract(i, "day");
			const label = date.format(timeFormat[filter]);
			filled.push({ name: label, value: map.get(label) ?? 0 });
		}
	}

	// Get total days in current month
	if (filter === "monthly") {
		const today = now.endOf("day");
		const startDate = today.subtract(1, "month").add(1, "day");
		const daysDiff = today.diff(startDate, "day");

		for (let i = 0; i <= daysDiff; i++) {
			const date = startDate.add(i, "day");
			const label = date.format(timeFormat[filter]);
			filled.push({ name: label, value: map.get(label) ?? 0 });
		}
	}

	if (filter === "yearly") {
		const endOfThisMonth = now.endOf("month");
		const startDate = endOfThisMonth.subtract(11, "month").startOf("month");
		const monthsDiff = endOfThisMonth.diff(startDate, "month");

		for (let i = 0; i <= monthsDiff; i++) {
			const date = startDate.add(i, "month");
			const label = date.format(timeFormat[filter]);
			filled.push({ name: label, value: map.get(label) ?? 0 });
		}
	}

	return filled;
};
