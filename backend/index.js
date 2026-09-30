import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import teacherRoutes from "./routes/teacher.js"
dotenv.config();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(cookieParser());
app.use('/',teacherRoutes)

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.LOCAL_MONGODB)
  .then(() => {
    console.log("✔  MongoDB connected");;

app.listen(PORT, () => {
      console.log(`✔  Server running on http://localhost:${PORT}`);
      console.log("________________________________________\n");
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });
