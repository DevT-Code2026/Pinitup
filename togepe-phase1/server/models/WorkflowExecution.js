import mongoose from "mongoose";

const STATUSES = ["queued", "running", "completed", "failed", "refunded"];

const workflowExecutionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    workflow: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workflow",
      required: true,
    },
    workflowName: { type: String, required: true },
    slug: { type: String, required: true },
    provider: { type: String, required: true },
    creditsSpent: { type: Number, required: true },
    executionReference: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: STATUSES,
      default: "queued",
    },
    input: { type: mongoose.Schema.Types.Mixed, default: {} },
    output: { type: mongoose.Schema.Types.Mixed },
    error: { type: String },
    startedAt: { type: Date },
    completedAt: { type: Date },
    refunded: { type: Boolean, default: false },
    refundReference: { type: String },
  },
  { timestamps: true }
);

workflowExecutionSchema.index({ user: 1, createdAt: -1 });
workflowExecutionSchema.index({ user: 1, slug: 1, status: 1 });

export default mongoose.model("WorkflowExecution", workflowExecutionSchema);
