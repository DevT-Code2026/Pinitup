import express from "express";
import protect from "../middleware/authMiddleware.js";
import optionalAuth from "../middleware/optionalAuth.js";
import upload, { handleUploadErrors } from "../middleware/uploadMiddleware.js";
import {
  createContent,
  getAllContent,
  getContentById,
  deleteContent,
  getCategories,
} from "../controllers/contentController.js";

const router = express.Router();

// GET /api/content/ping — must be before /:id to avoid collision
router.get("/ping", (req, res) => res.json({ message: "content route working" }));

// GET /api/content/categories
router.get("/categories", optionalAuth, getCategories);

// POST /api/content
router.post("/", protect, upload.single("media"), handleUploadErrors, createContent);

// GET /api/content?page=1&limit=20&search=...&category=...&sort=...
router.get("/", optionalAuth, getAllContent);

// GET /api/content/:id
router.get("/:id", optionalAuth, getContentById);

// DELETE /api/content/:id
router.delete("/:id", protect, deleteContent);

export default router;
