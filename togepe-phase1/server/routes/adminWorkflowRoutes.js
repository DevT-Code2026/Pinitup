import express from "express";
import protect from "../middleware/authMiddleware.js";
import requireAdmin from "../middleware/roleMiddleware.js";
import {
  getAllWorkflowsAdmin,
  createWorkflow,
  updateWorkflow,
  deactivateWorkflow,
} from "../controllers/workflowController.js";

const router = express.Router();

router.get("/", protect, requireAdmin, getAllWorkflowsAdmin);
router.post("/", protect, requireAdmin, createWorkflow);
router.put("/:id", protect, requireAdmin, updateWorkflow);
router.delete("/:id", protect, requireAdmin, deactivateWorkflow);

export default router;
