import mongoose from "mongoose";

const workflowSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Workflow name is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Workflow slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    provider: {
      type: String,
      required: [true, "Provider is required"],
      enum: {
        values: ["gemini", "openai", "claude", "segmind"],
        message: "Provider must be gemini, openai, claude, or segmind",
      },
    },
    creditCost: {
      type: Number,
      required: [true, "Credit cost is required"],
      min: [0, "Credit cost cannot be negative"],
      validate: {
        validator: Number.isInteger,
        message: "Credit cost must be an integer",
      },
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

workflowSchema.index({ slug: 1 });
workflowSchema.index({ status: 1 });

export default mongoose.model("Workflow", workflowSchema);
