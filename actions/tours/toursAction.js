import { db } from "../../db/db.js";

// get all tours data
export const tourData = async (req, res, next) => {
  try {
    const getTours = await db.tours.findMany({});
    res.status(200).json({ status: "SUCCESS", getTours });
  } catch (error) {
    next(error);
  }
};

// get single tour data
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

// create tour review

export const tourReviews = async (req, res, next) => {
  const { text, rating, reviewImages, toursId, userId } = req.body;
  try {
    const addReview = await db.reviews.create({
      data: {
        text,
        rating,
        reviewImages,
        toursId,
        userId,
      },
    });
    res.status(201).json({ status: "SUCCESS", addReview });
  } catch (error) {
    next(error);
  }
};
