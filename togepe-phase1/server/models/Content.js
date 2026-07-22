import mongoose from "mongoose";

const contentSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["image", "video"], required: true },
    mediaUrl: { type: String, required: true },
    mediaPublicId: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    category: { type: String, required: true, trim: true },
    prompt: { type: String, required: true },
    tags: [{ type: String }],
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    likesCount: { type: Number, default: 0 },
    sharesCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

contentSchema.index({ category: 1 });
contentSchema.index({ createdAt: -1 });
contentSchema.index({ likesCount: -1 });

export default mongoose.model("Content", contentSchema);