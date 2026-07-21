import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // Only required for local (email/password) accounts — Google accounts
    // never set a password.
    passwordHash: {
      type: String,
      required: function () {
        return this.provider === "local";
      },
    },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    provider: { type: String, enum: ["local", "google"], default: "local" },
    googleId: { type: String, unique: true, sparse: true }, // sparse: many users won't have one
    avatar: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);