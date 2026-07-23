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
// Custom callback handler provides better error logging and debugging.
router.get("/google/callback", (req, res, next) => {
  passport.authenticate("google", { session: false }, (err, user, info) => {
    if (err) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_error`);
    }
    if (!user) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
    }
    req.user = user;
    next();
  })(req, res, next);
}, googleAuthCallback);

router.get("/ping", (req, res) => res.json({ message: "auth route working" }));

export default router;
