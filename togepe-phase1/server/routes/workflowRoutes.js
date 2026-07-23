import express from "express";
import { getAllWorkflows, getWorkflowBySlug } from "../controllers/workflowController.js";

const router = express.Router();

router.get("/", getAllWorkflows);
router.get("/:slug", getWorkflowBySlug);

export default router;
