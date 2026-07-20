import express from "express";

const router = express.Router();

// Day 4 will implement these:
// router.post("/", protect, createBoard);
// router.post("/:id/save", protect, saveContentToBoard);

router.get("/ping", (req, res) => res.json({ message: "board route working" }));

export default router;
