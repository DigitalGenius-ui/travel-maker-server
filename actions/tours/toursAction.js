import { db } from "../../db/db.js";
import Stripe from "stripe";

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

// create stripe payment to pay for tour book
export const tourBookPayment = async (req, res, next) => {
  const { formItems, bookData } = req.body;

  const stripe = Stripe(process.env.STRIP_API_KEY);

  // print the tours that has more than one qunatity
  const tourWithQty = formItems.filter((item) => item.quantity > 0);
  console.log(tourWithQty);

  const lineItems = tourWithQty.map((item) => {
    return {
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          images: [item.image],
          description: item.description,
          metadata: {
            id: item.id,
          },
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    };
  });
  try {
    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/checkout/success`,
      cancel_url: `${process.env.CLIENT_URL}/`,
    });

    // I changed it because I am using button not a form.
    res.send({ url: session.url });
  } catch (error) {
    next(error);
  }
};
