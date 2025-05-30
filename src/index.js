import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
// import tourRoute from "./Routers/tours/tourRouter.js";
import authRoute from "./Routers/authRouter.js";
// import userDetailsRoute from "./Routers/user/userDetails.js";
import { CLIENT_URL, PORT } from "./constants/env.js";
import { errorHandling } from "./middleware/errorHandling.js";

dotenv.config();

console.log(PORT);

const app = express();

// node configurations
app.use(express.json({ limit: "25mb" }));
app.use(cors({ credentials: true, origin: CLIENT_URL() }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));
app.use(cookieParser());

// api routes
// app.use("/api/tours", tourRoute);
app.use("/api/auth", authRoute);
// app.use("/api/user", userDetailsRoute);

// error handling middleware
app.use(errorHandling);

// port for opening the application
app.listen(PORT(), () => {
  console.log(`Server is connected at port ${PORT()}`);
});
