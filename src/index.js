import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import tourRoute from "./Routers/tour-routers.js";
import authRoute from "./Routers/auth-routers.js";
import userDetailsRoute from "./Routers/user-routers.js";
import dashboardRoute from "./Routers/dashboard-routers.js";
import { CLIENT_URL, PORT } from "./constants/env.js";
import { errorHandling } from "./middleware/errorHandling.js";

dotenv.config();

const app = express();

// node configurations
app.use(express.json());
app.use(cors({ credentials: true, origin: CLIENT_URL() }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// api routes
app.use("/api/tours", tourRoute);
app.use("/api/auth", authRoute);
app.use("/api/user", userDetailsRoute);
app.use("/api/dashboard", dashboardRoute);

// error handling middleware
app.use(errorHandling);

// port for opening the application
app.listen(PORT(), () => {
	console.log(`Server is connected at port ${PORT()}`);
});
