import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  getExecutionHistory,
  getExecutionById,
} from "../controllers/workflowController.js";

const router = express.Router();

router.get("/", protect, getExecutionHistory);
router.get("/:id", protect, getExecutionById);

export default router;
