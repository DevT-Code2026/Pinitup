import express from "express";
import protect from "../middleware/authMiddleware.js";
import optionalAuth from "../middleware/optionalAuth.js";
import upload, { handleUploadErrors } from "../middleware/uploadMiddleware.js";
import {
  createContent,
  getAllContent,
  getContentById,
  deleteContent,
} from "../controllers/contentController.js";

const router = express.Router();

// POST /api/content
// Requires an authenticated user (req.user.id) — createContent uses it as
// uploadedBy. Full admin-only enforcement (requireAdmin) is deferred until
// role-based authorization is implemented per the founder's prototype
// decision; for now any authenticated user can post.
router.post("/", protect, upload.single("media"), handleUploadErrors, createContent);

// GET /api/content
// Public — uses optionalAuth so authenticated users get full access
// (no 5-item guest limit), while unauthenticated guests still see
// the first GUEST_CONTENT_LIMIT items.
router.get("/", optionalAuth, getAllContent);

// GET /api/content/:id
// Public — uses optionalAuth for the same reason as above.
router.get("/:id", optionalAuth, getContentById);

// DELETE /api/content/:id
// Requires an authenticated user. Admin-only enforcement deferred for the
// same reason as POST /.
router.delete("/:id", protect, deleteContent);

router.get("/ping", (req, res) => res.json({ message: "content route working" }));

export default router;