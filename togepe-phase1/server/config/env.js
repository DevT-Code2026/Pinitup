// Loads environment variables as a side effect. Imported first (before any
// other local module) in server.js so that modules which read process.env
// at module-load time — like config/passport.js's GoogleStrategy setup and
// routes/authRoutes.js's failureRedirect — see real values instead of
// undefined. (dotenv.config() previously ran after all imports were
// already evaluated, due to ES module import hoisting.)
import dotenv from "dotenv";
dotenv.config();