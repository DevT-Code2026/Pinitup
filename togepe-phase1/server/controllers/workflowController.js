import mongoose from "mongoose";
import WorkflowService from "../services/workflowService.js";
import WorkflowExecutionService from "../services/workflowExecutionService.js";
import { uploadBufferToCloudinary } from "../config/cloudinary.js";

/**
 * POST /api/workflows/upload
 * Protected — upload two images for use in workflow execution.
 * Multer (memoryStorage) places file buffers on req.files.couple_image[0]
 * and req.files.meme_image[0]. Both are streamed to Cloudinary.
 * Returns the public HTTPS URLs the frontend will pass to execute.
 */
export const uploadWorkflowImage = async (req, res) => {
  try {
    const coupleFile = req.files?.couple_image?.[0];
    const memeFile = req.files?.meme_image?.[0];

    if (!coupleFile || !memeFile) {
      return res.status(400).json({
        message: "Both couple_image and meme_image are required",
      });
    }

    const [coupleResult, memeResult] = await Promise.all([
      uploadBufferToCloudinary(coupleFile.buffer, {
        resourceType: "image",
        folder: "pinitup/workflows",
      }),
      uploadBufferToCloudinary(memeFile.buffer, {
        resourceType: "image",
        folder: "pinitup/workflows",
      }),
    ]);

    res.status(200).json({
      coupleImage: coupleResult.secure_url,
      memeImage: memeResult.secure_url,
    });
  } catch (error) {
    console.error("[WorkflowController] Upload error:", error.message);
    res.status(500).json({ message: "Image upload failed", error: error.message });
  }
};

/**
 * GET /api/workflows
 * Public — returns all active workflows.
 */
export const getAllWorkflows = async (req, res) => {
  try {
    const workflows = await WorkflowService.getAllActiveWorkflows();
    res.json({ workflows });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch workflows", error: error.message });
  }
};

/**
 * GET /api/workflows/:slug
 * Public — returns a single active workflow by slug.
 */
export const getWorkflowBySlug = async (req, res) => {
  try {
    const workflow = await WorkflowService.getWorkflowBySlug(req.params.slug);

    if (!workflow) {
      return res.status(404).json({ message: "Workflow not found" });
    }

    if (workflow.status !== "active") {
      return res.status(404).json({ message: "Workflow not found" });
    }

    res.json({ workflow });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch workflow", error: error.message });
  }
};

/**
 * POST /api/admin/workflows
 * Admin — create a new workflow.
 */
export const createWorkflow = async (req, res) => {
  try {
    const { name, slug, description, provider, creditCost, status } = req.body;

    const workflow = await WorkflowService.createWorkflow({
      name,
      slug,
      description,
      provider,
      creditCost,
      status,
    });

    res.status(201).json({ workflow });
  } catch (error) {
    if (error.message.includes("already exists")) {
      return res.status(409).json({ message: error.message });
    }
    if (error.message.includes("required") || error.message.includes("cannot be negative") || error.message.includes("must be an integer") || error.message.includes("Slug must")) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Failed to create workflow", error: error.message });
  }
};

/**
 * PUT /api/admin/workflows/:id
 * Admin — update an existing workflow.
 */
export const updateWorkflow = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid workflow id" });
    }

    const workflow = await WorkflowService.updateWorkflow(id, req.body);
    res.json({ workflow });
  } catch (error) {
    if (error.message === "Workflow not found") {
      return res.status(404).json({ message: error.message });
    }
    if (error.message.includes("already exists")) {
      return res.status(409).json({ message: error.message });
    }
    if (error.message.includes("cannot be empty") || error.message.includes("cannot be negative") || error.message.includes("must be an integer") || error.message.includes("Slug must")) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Failed to update workflow", error: error.message });
  }
};

/**
 * DELETE /api/admin/workflows/:id
 * Admin — soft-delete a workflow (set status to inactive).
 */
export const deactivateWorkflow = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid workflow id" });
    }

    const workflow = await WorkflowService.deactivateWorkflow(id);
    res.json({ workflow, message: "Workflow deactivated" });
  } catch (error) {
    if (error.message === "Workflow not found") {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: "Failed to deactivate workflow", error: error.message });
  }
};

/**
 * GET /api/admin/workflows
 * Admin — returns all workflows (active and inactive).
 */
export const getAllWorkflowsAdmin = async (req, res) => {
  try {
    const workflows = await WorkflowService.getAllWorkflows();
    res.json({ workflows });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch workflows", error: error.message });
  }
};

/**
 * POST /api/workflows/:slug/execute
 * Protected — execute a workflow with full lifecycle management.
 */
export const executeWorkflow = async (req, res) => {
  try {
    const { slug } = req.params;
    const { input } = req.body || {};
    const userId = req.user.id;

    const result = await WorkflowExecutionService.execute(userId, slug, input);

    const responseBody = {
      success: true,
      execution: result.execution,
      refunded: result.refunded,
      wallet: result.wallet,
    };

    if (result.refunded) {
      responseBody.refundCredits = result.refundCredits;
    }

    res.status(200).json(responseBody);
  } catch (error) {
    const status = error.statusCode || 500;

    if (error.meta) {
      return res.status(status).json({
        message: error.message,
        ...error.meta,
      });
    }

    res.status(status).json({ message: error.message });
  }
};

/**
 * GET /api/executions
 * Protected — paginated execution history for the authenticated user.
 */
export const getExecutionHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));

    const result = await WorkflowExecutionService.getHistory(userId, { page, limit });
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch execution history", error: error.message });
  }
};

/**
 * GET /api/executions/:id
 * Protected — single execution detail (owner or admin only).
 */
export const getExecutionById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid execution id" });
    }

    const execution = await WorkflowExecutionService.getById(id, req.user.id, req.user.role);

    if (!execution) {
      return res.status(404).json({ message: "Execution not found" });
    }

    res.json({ execution });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch execution", error: error.message });
  }
};
