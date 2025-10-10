// import { EMAIL_SENDER, NODE_ENV } from "../constants/env.js";
import resend from "../config/resend.js";

// const getFromEmail = () =>
//   NODE_ENV() === "development" ? "onboarding@resend.dev" : EMAIL_SENDER();

// const getToEmail = (to) =>
//   NODE_ENV() === "development" ? "delivered@resend.dev" : to;

export const sendEmail = async ({ subject, text, html }) => {
	return await resend.emails.send({
		from: "onboarding@resend.dev",
		to: "delivered@resend.dev",
		subject,
		html,
		text,
	});
};
