import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import tourRoute from "./Routers/tours/tourRouter.js";
import userRoute from "./Routers/user/userRouter.js";
import profileRoute from "./Routers/user/profileRouter.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors({ credentials: true, origin: true }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/tours", tourRoute);
app.use("/api/auth", userRoute);
app.use("/api/profile", profileRoute);

app.listen(process.env.PORT, () => {
  console.log(`Server is connected at port ${process.env.PORT}`);
});
