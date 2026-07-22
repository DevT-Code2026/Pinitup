import express from "express";
import protect from "../middleware/authMiddleware.js";
import { toggleLike } from "../controllers/likeController.js";

const router = express.Router();

// POST /api/likes/:contentId — toggle like/unlike (authenticated)
router.post("/:contentId", protect, toggleLike);

router.get("/ping", (req, res) => res.json({ message: "like route working" }));

export default router;
