import mongoose from "mongoose";

const contentSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["image", "video"], required: true },
    mediaUrl: { type: String, required: true },
    mediaPublicId: { type: String, required: true },
    prompt: { type: String, required: true },
    tags: [{ type: String }],
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    likesCount: { type: Number, default: 0 },
    sharesCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Content", contentSchema);