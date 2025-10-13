import { db } from "../config/db.js";
import { CLIENT_URL } from "../constants/env.js";
import { INTERNAL_SERVER_ERROR, NOT_FOUND } from "../constants/http.js";
import AppAssert from "../utils/Appassert.js";
import { getTicketTemplate } from "../utils/emailTemplate.js";
import { sendEmail } from "../utils/sendEmail.js";
import { handleUploadImage } from "../utils/uploadImg.js";

// get all Tours
export const getAllTours = async (limit, page, cat) => {
	const pagination = +limit && +page ? { skip: (+page - 1) * +limit, take: +limit } : {};
	const filter = cat ? { where: { category: cat } } : {};
	const [allTours, tourCounts] = await Promise.all([
		await db.tours.findMany({
			...filter,
			...pagination,
			include: {
				_count: {
					select: { reviews: true },
				},
			},
		}),
		await db.tours.count(),
	]);
	AppAssert(allTours, INTERNAL_SERVER_ERROR, "Faild to get tours data!");
	const totalPages = Math.ceil(tourCounts / +limit);

	const finalTours = allTours.map(({ _count, ...tour }) => ({
		...tour,
		reviewCount: _count.reviews,
	}));

	return { allTours: finalTours, totalPages };
};

// get all Tours
export const singleTour = async tourId => {
	const getSingleTour = await db.tours.findFirst({
		where: { id: tourId },
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

	AppAssert(getSingleTour, INTERNAL_SERVER_ERROR, "Faild to get single tour data!");

	return getSingleTour;
};

// create tour review
export const tourReviews = async (data, userId) => {
	const { text, rating, reviewImages, toursId } = data;

	const addReview = await db.reviews.create({
		data: {
			text,
			rating,
			reviewImages,
			toursId,
			userId,
		},
	});

	AppAssert(addReview, INTERNAL_SERVER_ERROR, "Faild to create review!");

	return addReview;
};

// remove tour review
export const removeTourReviews = async (id, userId) => {
	const removeReview = await db.reviews.delete({
		where: { id, userId },
	});

	AppAssert(removeReview, INTERNAL_SERVER_ERROR, "Faild to remove review!");
	return removeReview;
};

// create stripe payment to pay for tour book
export const tourBookPayment = async (formItems, stripe) => {
	// print the tours that has more than one qunatity
	const tourWithQty = formItems.filter(item => item.quantity > 0);

	const lineItems = tourWithQty.map(item => {
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

	AppAssert(lineItems, INTERNAL_SERVER_ERROR, "Faild to generate strip line-items!");

	const session = await stripe.checkout.sessions.create({
		line_items: lineItems,
		mode: "payment",
		success_url: `${CLIENT_URL()}/checkout/success`,
		cancel_url: `${CLIENT_URL()}/`,
	});

	AppAssert(session, INTERNAL_SERVER_ERROR, "Payment is Faild!");

	return {
		url: session.url,
	};
};

// store saved ticket to the database
export const saveTicket = async (data, userId) => {
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
		bookTime,
		email,
		firstName,
		lastName,
		phone,
		totalPrice,
		tourImage,
		title,
	} = data;
	// creat ticket
	const createTicket = await db.bookings.create({
		data: {
			title,
			firstName,
			lastName,
			phone,
			email,
			travelDate: `${date} ${bookTime}`,
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

	AppAssert(createTicket, INTERNAL_SERVER_ERROR, "Failed to create ticket!");

	if (createTicket) {
		const { error } = await sendEmail({
			to: email,
			...getTicketTemplate({
				title: createTicket.title,
				firstName: createTicket.firstName,
				lastName: createTicket.lastName,
				phone: createTicket.phone,
				email: createTicket.email,
				travelDate: createTicket.travelDate,
				adult: createTicket.tickets.adult,
				child: createTicket.tickets.child,
				totalPrice: createTicket.totalPrice,
				verifyNumber: createTicket.verifyNumber,
				tourImage: createTicket.tourImage,
			}),
		});

		if (error) {
			console.log(error);
		}
	}
	return { createTicket };
};

// upload an array of images
export const uploadImages = async images => {
	AppAssert(images.length > 0, NOT_FOUND, "Please provide image to be uploaded.");

	const result = images.map(async image => await handleUploadImage(image));

	AppAssert(result.length > 0, INTERNAL_SERVER_ERROR, "Failed tp upload images!");

	return {
		result,
	};
};
