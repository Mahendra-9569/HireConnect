import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import jobRoutes from "./routes/job.js";
dotenv.config();

const app = express();

const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.use(express.json());
app.use("/api/job", jobRoutes);
export default app;
