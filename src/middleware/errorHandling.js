import { z } from "zod";
import AppError from "./AppError.js";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from "../constants/http.js";

const zodErrorHandler = (res, error) => {
	const errorMessage = error.issues.map(err => ({
		path: err.path.join("."),
		message: err.message,
	}));
	return res.status(BAD_REQUEST).json({ errorMessage });
};

const AppErrorHandle = (res, error) => {
	return res.status(error.statusCode).json({
		message: error.message,
		errorCode: error.errorCode,
	});
};

export const errorHandling = async (error, req, res) => {
	if (error instanceof AppError) {
		return AppErrorHandle(res, error);
	}

	if (error instanceof z.ZodError) {
		return zodErrorHandler(res, error);
	}

	return res.status(INTERNAL_SERVER_ERROR).send(error.message);
};
