import { db } from "../../db/db.js";
import Stripe from "stripe";
import cloudinary from "../cloudinary/cloudinary.js";
import { errorHandler } from "../../errorHandling/error.js";

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
  const id = req.params.id;
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

// remove tour review
export const removeTourReviews = async (req, res, next) => {
  const id = req.params.id;
  try {
    await db.reviews.delete({
      where: { id },
    });
    res
      .status(200)
      .json({ status: "SUCCESS", message: "Review has been removed." });
  } catch (error) {
    next(error);
  }
};

// create stripe payment to pay for tour book
export const tourBookPayment = async (req, res, next) => {
  const { formItems } = req.body;

  const stripe = Stripe(process.env.STRIP_API_KEY);

  // print the tours that has more than one qunatity
  const tourWithQty = formItems.filter((item) => item.quantity > 0);

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

// store saved ticket to the database
export const saveTicket = async (req, res, next) => {
  const randomNumber = () => {
    const length = 15;
    let numbers = "";

    for (let i = 0; i < length; i++) {
      const random = Math.floor(Math.random() * 10);
      numbers += random.toString();
    }

    return numbers;
  };
  const {
    adult,
    child,
    date,
    email,
    firstName,
    lastName,
    phone,
    userId,
    totalPrice,
    tourImage,
    title,
  } = req.body;
  try {
    await db.bookings.create({
      data: {
        title,
        firstName,
        lastName,
        phone,
        email,
        travelDate: date,
        tickets: {
          adult,
          child,
        },
        totalPrice,
        tourImage,
        verifyNumber: randomNumber(),
        userId,
      },
    });
    return res
      .status(200)
      .json({ status: "SUCCESS", message: "Ticket is created." });
  } catch (error) {
    next(error);
  }
};

// upload an array of images
export const uploadImages = async (req, res, next) => {
  const images = req.body;

  try {
    if (images.length === 0) {
      return next(errorHandler(404, "Please provide image to be uploaded."));
    } else {
      const uploadPromises = images.map((image) => {
        return cloudinary.uploader.upload(image, {
          upload_preset: "travel_maker",
        });
      });

      Promise.all(uploadPromises)
        .then((results) => {
          return res.status(200).json({ status: "SUCCESS", results });
        })
        .catch((err) => {
          throw new Error(err.message);
        });
    }
  } catch (error) {
    next(error);
  }
};
