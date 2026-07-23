import mongoose from "mongoose";
import WorkflowService from "../services/workflowService.js";

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
