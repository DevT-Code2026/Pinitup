import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";

// Stateless — no serializeUser/deserializeUser or session store needed
// since every route using this runs with { session: false } and the app
// issues its own JWT afterwards (see authController.googleAuthCallback).
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

        // 1. Existing Google user — log them in.
        let user = await User.findOne({ googleId: profile.id });
        if (user) return done(null, user);

        // 2. No Google-linked account yet, but the email already exists as
        // a local account — link Google to it instead of creating a
        // duplicate user. Existing local login keeps working unchanged.
        if (email) {
          user = await User.findOne({ email });
          if (user) {
            user.googleId = profile.id;
            if (!user.avatar) user.avatar = avatar;
            await user.save();
            return done(null, user);
          }
        }

        // 3. Brand-new user — create with provider "google", no password.
        user = await User.create({
          name: profile.displayName || "Google User",
          email,
          provider: "google",
          googleId: profile.id,
          avatar,
        });

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Serialize only the user ID into the session (required when using
// passport.session() for Google OAuth state parameter support).
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
