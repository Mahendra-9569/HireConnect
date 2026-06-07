const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");

const app = express();


app.use(express.json());
app.use(cookieParser());

const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));


const interviewRouter = require("./routes/interview.routes");
app.use("/api/interview", interviewRouter);


module.exports = app;