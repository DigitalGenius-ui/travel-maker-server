import dayjs from "dayjs";

const timeFormat = {
  weekly: "MMM DD, YYYY",
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
  const percentageChange =
    ((current - previous) / Math.abs(previous || 1)) * 100;
  const percent = Math.max(-100, Math.min(percentageChange, 100));

  return {
    percent: Math.abs(+percent),
  };
};

// adding full week, month and year.
export const fillMissingChartDate = (filter, data) => {
  const map = new Map(data.map((d) => [d.name, d.value]));
  const filled = [];

  const now = dayjs();

  if (filter === "weekly") {
    // Always show the last 7 days, ending today
    for (let i = 6; i >= 0; i--) {
      const date = now.subtract(i, "day");
      const label = date.format(timeFormat[filter]);
      filled.push({ name: label, value: map.get(label) ?? 0 });
    }
  }

  // Get total days in current month
  if (filter === "monthly") {
    const startOfMonth = now.startOf("month");
    const today = now.date();

    for (let i = 0; i < today; i++) {
      const date = startOfMonth.add(i, "day");
      const label = date.format(timeFormat[filter]);
      filled.push({ name: label, value: map.get(label) ?? 0 });
    }
  }

  if (filter === "yearly") {
    const currentMonth = now.month();
    for (let i = 0; i <= currentMonth; i++) {
      const date = now.month(i);
      const label = date.format(timeFormat[filter]);
      filled.push({ name: label, value: map.get(label) ?? 0 });
    }
  }

  return filled;
};
