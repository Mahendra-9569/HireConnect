import mongoose from "mongoose";
const CompanySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, index: true },
  description: { type: String, required: true },
  website: { type: String, required: true },
  logo: { type: String, required: true },
  logo_public_id: { type: String, required: true },
  recruiter_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: { createdAt: "created_at", updatedAt: false } });
export default mongoose.models.Company || mongoose.model("Company", CompanySchema);
