import mongoose from "mongoose";
const ApplicationSchema = new mongoose.Schema({
  job_id: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
  applicant_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  applicant_email: { type: String, required: true },
  status: { type: String, enum: ["Submitted", "Rejected", "Hired"], default: "Submitted" },
  resume: { type: String, required: true },
  subscribed: { type: Boolean, default: false }
}, { timestamps: { createdAt: "applied_at", updatedAt: false } });
ApplicationSchema.index({ job_id: 1, applicant_id: 1 }, { unique: true });
export default mongoose.models.Application || mongoose.model("Application", ApplicationSchema);
