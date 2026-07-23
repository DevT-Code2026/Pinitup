import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";
import CreditService from "../services/creditService.js";

const ADMIN_EMAILS = new Set([
  "content@npl.live",
  "shylesh@npl.live",
  "dev@npl.live",
]);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value?.toLowerCase();
        const avatar = profile.photos?.[0]?.value;
        const isAdminEmail = email && ADMIN_EMAILS.has(email);

        // 1. Existing Google user
        let user = await User.findOne({ googleId: profile.id });
        if (user) {
          if (isAdminEmail && user.role !== "admin") {
            user.role = "admin";
            await user.save();
          }
          return done(null, user);
        }

        // 2. Link Google to existing local account
        if (email) {
          user = await User.findOne({ email });
          if (user) {
            user.googleId = profile.id;
            if (!user.avatar) user.avatar = avatar;
            if (isAdminEmail && user.role !== "admin") {
              user.role = "admin";
            }
            await user.save();
            return done(null, user);
          }
        }

        // 3. Brand-new user
        user = await User.create({
          name: profile.displayName || "Google User",
          email,
          provider: "google",
          googleId: profile.id,
          avatar,
          role: isAdminEmail ? "admin" : "user",
        });

        try {
          await CreditService.awardSignupBonus(user._id);
        } catch (bonusError) {
          await User.deleteOne({ _id: user._id });
          return done(bonusError, null);
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Stateless — no serializeUser/deserializeUser or session store needed
// since every route using this runs with { session: false } and the app
// issues its own JWT afterwards (see authController.googleAuthCallback).
passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
