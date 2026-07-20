// Run once manually to create the super admin account:
//   node seedAdmin.js
//
// Not wired into any route — deliberately kept out of the public API
// so no one can grant themselves admin through signup.

import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import User from "./models/User.js";

dotenv.config();

const ADMIN_NAME = "Super Admin";
const ADMIN_EMAIL = "admin@togepe.com"; // change before running
const ADMIN_PASSWORD = "changeme123";    // change before running

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    console.log("Admin already exists:", ADMIN_EMAIL);
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  const admin = await User.create({
    name: ADMIN_NAME,
    email: ADMIN_EMAIL,
    passwordHash,
    role: "admin",
  });

  console.log("Super admin created:", admin.email);
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
