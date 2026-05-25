const mongoose = require("mongoose");
const pdfParse = require("pdf-parse");

const {
  generateInterviewReport,
  generateResumePdf
} = require("../services/ai.service");

const interviewReportModel = require("../models/interviewReport.model");


async function generateInterViewReportController(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Resume file is required" });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized user" });
    }

    const { selfDescription, jobDescription } = req.body;

    if (!jobDescription) {
      return res.status(400).json({ message: "Job description is required" });
    }

    let pdfData;
    try {
      pdfData = await pdfParse(req.file.buffer);
    } catch (err) {
      console.log("PDF ERROR:", err.message);
      return res.status(400).json({ message: "Invalid PDF file" });
    }

    const resumeText = pdfData.text || "";

    const aiResult = await generateInterviewReport({
      resume: resumeText,
      selfDescription,
      jobDescription
    });

    const interviewReport = await interviewReportModel.create({
      applicant_id: new mongoose.Types.ObjectId(String(req.user.id)),

      title: aiResult?.jobTitle || "Untitled Position",
      resume: resumeText,
      selfDescription,
      jobDescription,

      technicalQuestions: aiResult?.technicalQuestions || [],
      behavioralQuestions: aiResult?.behavioralQuestions || [],
      preparationPlan: aiResult?.preparationPlan || [],
      matchScore: aiResult?.score || 0,
      skillGaps: aiResult?.skillGaps || []
    });

    return res.status(201).json({
      success: true,
      message: "Interview report generated successfully",
      interviewId: interviewReport._id,
      interviewReport
    });

  } catch (err) {
    console.error("ERROR:", err);
    return res.status(500).json({ message: err.message });
  }
}


async function getInterviewReportByIdController(req, res) {
  try {
    const { interviewId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(interviewId)) {
      return res.status(400).json({ message: "Invalid interview ID" });
    }

    const interviewReport = await interviewReportModel.findOne({
      _id: interviewId,
    });

    if (!interviewReport) {
      return res.status(404).json({
        message: "Interview report not found"
      });
    }

    return res.status(200).json({
      success: true,
      interviewReport
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
}


async function getAllInterviewReportsController(req, res) {
  try {
    const interviewReports = await interviewReportModel
      .find({
        applicant_id: new mongoose.Types.ObjectId(String(req.user.id))
      })
      .sort({ createdAt: -1 })
      .select("-resume -selfDescription -jobDescription -__v");

    return res.status(200).json({
      success: true,
      interviewReports
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
}


async function generateResumePdfController(req, res) {
  try {
    const { interviewReportId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(interviewReportId)) {
      return res.status(400).json({ message: "Invalid interview ID" });
    }

    const interviewReport = await interviewReportModel.findOne({
      _id: interviewReportId,
        applicant_id: new mongoose.Types.ObjectId(String(req.user.id))
    });

    if (!interviewReport) {
      return res.status(404).json({
        message: "Interview report not found"
      });
    }

    const { resume, jobDescription, selfDescription } = interviewReport;

    const pdfBuffer = await generateResumePdf({
      resume,
      jobDescription,
      selfDescription
    });

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`
    });
    return res.send(pdfBuffer);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
}


module.exports = {
  generateInterViewReportController,
  getInterviewReportByIdController,
  getAllInterviewReportsController,
  generateResumePdfController
};