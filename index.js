import express from "express";
import dotenv from "dotenv";
import tourRoute from "./Routers/tours/tourRouter.js";
import userRouter from "./Routers/user/userRouter.js";
import cors from "cors";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors({ credentials: true, origin: true }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/tours", tourRoute);
app.use("/api/auth", userRouter);

app.listen(process.env.PORT, () => {
  console.log(`Server is connected at port ${process.env.PORT}`);
});
