import express from "express";
import protect from "../middleware/authMiddleware.js";
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
// Public — no `protect` here on purpose. getAllContent checks req.user
// itself and falls back to the guest 5-item limit when it's absent, so
// guests must be able to reach this route without a token.
router.get("/", getAllContent);

// GET /api/content/:id
// Public, same reasoning as above.
router.get("/:id", getContentById);

// DELETE /api/content/:id
// Requires an authenticated user. Admin-only enforcement deferred for the
// same reason as POST /.
router.delete("/:id", protect, deleteContent);

router.get("/ping", (req, res) => res.json({ message: "content route working" }));

export default router;