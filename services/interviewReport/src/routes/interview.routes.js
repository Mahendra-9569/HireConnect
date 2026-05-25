const express = require("express");
const interviewController = require("../controllers/interview.controller");
const upload = require("../middlewares/file.middleware");
const protect = require("../middlewares/auth.middleware");

const interviewRouter = express.Router();

interviewRouter.post("/", protect, upload.single("resume"), interviewController.generateInterViewReportController);
interviewRouter.get("/", protect, interviewController.getAllInterviewReportsController);
interviewRouter.get("/:interviewId", protect, interviewController.getInterviewReportByIdController);
interviewRouter.get("/resume/pdf/:interviewReportId", protect, interviewController.generateResumePdfController);

module.exports = interviewRouter;