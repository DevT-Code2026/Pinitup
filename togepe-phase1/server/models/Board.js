import mongoose from "mongoose";

const boardSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    savedContent: [{ type: mongoose.Schema.Types.ObjectId, ref: "Content" }],
  },
  { timestamps: true }
);

boardSchema.index({ owner: 1, name: 1 }, { unique: true });

export default mongoose.model("Board", boardSchema);
