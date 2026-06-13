import express from "express";
import cors from "cors";
import routes from "./routes.js";
import dotenv from "dotenv";
dotenv.config();
const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use("/api/utils", routes);
export default app;
