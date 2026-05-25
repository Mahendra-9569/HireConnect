import mongoose from "mongoose";
const JobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  salary: { type: Number, default: null },
  location: { type: String, default: null },
  job_type: { type: String, required: true },
  openings: { type: Number, required: true },
  role: { type: String, required: true },
  work_location: { type: String, required: true },
  company_id: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
  posted_by_recuriter_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  is_active: { type: Boolean, default: true }
}, { timestamps: { createdAt: "created_at", updatedAt: false } });
export default mongoose.models.Job || mongoose.model("Job", JobSchema);
