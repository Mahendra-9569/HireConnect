import mongoose from "mongoose";

const BlackListSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
  },
  { timestamps: true }
);

const BlackList = mongoose.models.BlackList || mongoose.model("BlackList", BlackListSchema);
export default BlackList;
