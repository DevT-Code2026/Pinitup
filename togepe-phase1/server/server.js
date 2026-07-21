// Must be the first import — loads .env before any other module (including
// config/passport.js and routes/authRoutes.js) evaluates process.env at
// module-load time. See config/env.js for why this matters.
import "./config/env.js";

import express from "express";
import cors from "cors";
import passport from "passport";
import connectDB from "./config/db.js";
import "./config/passport.js"; // registers the Google OAuth strategy as a side effect

import authRoutes from "./routes/authRoutes.js";
import contentRoutes from "./routes/contentRoutes.js";
import boardRoutes from "./routes/boardRoutes.js";
import likeRoutes from "./routes/likeRoutes.js";

connectDB();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json());
app.use(passport.initialize());

app.get("/", (req, res) => res.send("Togepe API is running"));

app.use("/api/auth", authRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/boards", boardRoutes);
app.use("/api/likes", likeRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));