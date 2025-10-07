import dayjs from "dayjs";
import { db } from "../config/db.js";
import { oneMonth, oneWeek, oneYear } from "../utils/date.js";

// when weekly, monthly or yearly should show based on last time percentage.
// for weekly should show day names for monthly shows year.

// get dash insight
const filterBased = {
  weekly: oneWeek(),
  monthly: oneYear(),
};

const displayTime = {
  weekly: "ddd",
  monthly: "MMM",
  yearly: "YYYY",
};

export const getInsight = async (filter) => {
  //total bookings
  const [bookings, totalBokings] = await Promise.all([
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
    await db.bookings.count(),
  ]);

  // total earnings
  const totalEarnings = bookings.reduce((acc, item) => {
    return (acc += +item.totalPrice);
  }, 0);

  // group each days of the weeks fo earning
  const earningsTime = bookings.reduce((acc, item) => {
    const day = dayjs(item.createAt.toISOString().split("T")[0]).format(
      displayTime[filter]
    );
    acc[day] = (acc[day] || 0) + +item.totalPrice;
    return acc;
  }, {});

  //total new customers
  const totlCustomer = await db.user.count();

  return {
    totalBokings,
    totlCustomer,
    earnings: {
      totalEarnings,
      earningsTime,
    },
  };
};
