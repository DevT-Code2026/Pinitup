import express from "express";
import protect from "../middleware/authMiddleware.js";
import upload, { handleUploadErrors } from "../middleware/uploadMiddleware.js";
import {
  getAllWorkflows,
  getWorkflowBySlug,
  executeWorkflow,
  uploadWorkflowImage,
} from "../controllers/workflowController.js";

const router = express.Router();

router.get("/", getAllWorkflows);
router.post("/upload", protect, upload.single("image"), handleUploadErrors, uploadWorkflowImage);
router.post("/:slug/execute", protect, executeWorkflow);
router.get("/:slug", getWorkflowBySlug);

export default router;
