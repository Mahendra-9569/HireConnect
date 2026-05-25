import mongoose from "mongoose";
const JobSchema = new mongoose.Schema({
  title: String,
  description: String,
  salary: Number,
  location: String,
  job_type: String,
  openings: Number,
  role: String,
  work_location: String,
  company_id: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
  posted_by_recuriter_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  is_active: { type: Boolean, default: true }
}, { timestamps: { createdAt: "created_at", updatedAt: false } });
export default mongoose.models.Job || mongoose.model("Job", JobSchema);
