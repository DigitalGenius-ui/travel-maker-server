import { db } from "../../db/db.js";

export const tourData = async (req, res, next) => {
  try {
    const getTours = await db.tours.findMany({});
    res.status(200).json({ status: "SUCCESS", getTours });
  } catch (error) {
    next(error);
  }
};

export const singleTour = async (req, res, next) => {
  const id = req.query.id;
  try {
    const singleTour = await db.tours.findFirst({
      where: { id },
      include: {
        reviews: {
          orderBy: {
            createAt: "desc",
          },
          include: {
            user: {
              include: {
                profile: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({ status: "SUCCESS", singleTour });
  } catch (error) {
    next(error);
  }
};
