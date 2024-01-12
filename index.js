import express from "express";
import dotenv from "dotenv";
import tourRoute from "./Routers/tour.js";
import cors from "cors";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/tours", tourRoute);

app.listen(process.env.PORT, () => {
  console.log(`Server is connected at port ${process.env.PORT}`);
});
