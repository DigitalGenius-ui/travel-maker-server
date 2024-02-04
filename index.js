import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import tourRoute from "./Routers/tours/tourRouter.js";
import authRoute from "./Routers/auth/authRouter.js";
import userDetailsRoute from "./Routers/user/userDetails.js";

dotenv.config();

const app = express();

// node configurations
app.use(express.json({ limit: "25mb" }));
app.use(cors({ credentials: true, origin: "http://localhost:5173" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));
app.use(cookieParser());

// api routes
app.use("/api/tours", tourRoute);
app.use("/api/auth", authRoute);
app.use("/api/user", userDetailsRoute);

// port for opening the application
app.listen(process.env.PORT, () => {
  console.log(`Server is connected at port ${process.env.PORT}`);
});

// error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  return res.status(statusCode).json({ status: "ERROR", message: message });
});
