import express from "express";
import passport from "passport";
import { registerUser, loginUser, googleAuthCallback } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

// GET /api/auth/google — starts the redirect flow to Google's consent screen
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);

// GET /api/auth/google/callback — Google redirects back here after consent
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: `${process.env.CLIENT_URL}/login` }),
  googleAuthCallback
);

router.get("/ping", (req, res) => res.json({ message: "auth route working" }));

export default router;