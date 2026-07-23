import express from "express";
import multer from "multer";
import protect from "../middleware/authMiddleware.js";
import { handleUploadErrors } from "../middleware/uploadMiddleware.js";
import {
  getAllWorkflows,
  getWorkflowBySlug,
  executeWorkflow,
  uploadWorkflowImage,
} from "../controllers/workflowController.js";

const router = express.Router();

const workflowUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);
    if (!allowed.has(file.mimetype)) {
      return cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed: jpg, png, webp.`));
    }
    cb(null, true);
  },
  limits: { fileSize: 10 * 1024 * 1024, files: 2 },
});

router.get("/", getAllWorkflows);
router.post(
  "/upload",
  protect,
  workflowUpload.fields([
    { name: "couple_image", maxCount: 1 },
    { name: "meme_image", maxCount: 1 },
  ]),
  handleUploadErrors,
  uploadWorkflowImage,
);
router.post("/:slug/execute", protect, executeWorkflow);
router.get("/:slug", getWorkflowBySlug);

export default router;
