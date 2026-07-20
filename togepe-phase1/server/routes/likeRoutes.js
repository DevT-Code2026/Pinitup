import express from "express";

const router = express.Router();

// Day 5 will implement these:
// router.post("/:contentId", protect, toggleLike);

router.get("/ping", (req, res) => res.json({ message: "like route working" }));

export default router;
