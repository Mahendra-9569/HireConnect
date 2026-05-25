import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    phone_number: { type: String, required: true },
    role: { type: String, required: true, enum: ["jobseeker", "recruiter"] },

    bio: { type: String, default: null },
    resume: { type: String, default: null },
    resume_public_id: { type: String, default: null },
    profile_pic: { type: String, default: null },
    profile_pic_public_id: { type: String, default: null },

    subscription: { type: Date, default: null },
    skills: { type: [String], default: [] },

    isVerified: { type: Boolean, default: false },
    otp: { type: String, default: null },
    otpExpires: { type: Date, default: null }
  },
  { timestamps: { createdAt: "created_at", updatedAt: false } }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);