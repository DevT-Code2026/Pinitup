import mongoose from "mongoose";
import { TransactionTypes } from "../utils/transactionTypes.js";

const creditTransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: Object.values(TransactionTypes),
    },
    amount: { type: Number, required: true },
    balanceBefore: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
    reference: { type: String, unique: true, sparse: true },
    description: { type: String },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

creditTransactionSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model("CreditTransaction", creditTransactionSchema);
