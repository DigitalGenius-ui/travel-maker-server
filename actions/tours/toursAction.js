import { db } from "../../db/db.js";

export const tourData = async (req, res) => {
  try {
    const getTours = await db.tours.findMany({});
    res.status(200).json({ status: "SUCCESS", getTours });
  } catch (error) {
    throw new Error(error.message);
  }
};

export const singleTour = async (req, res) => {
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
    throw new Error(error.message);
  }
};
