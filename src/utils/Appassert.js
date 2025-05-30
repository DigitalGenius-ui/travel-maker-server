import AppError from "../middleware/AppError.js";
import assert from "node:assert";

const AppAssert = (condition, httpStatusCode, message, appErrorCode) =>
  assert(condition, new AppError(httpStatusCode, message, appErrorCode));

export default AppAssert;
