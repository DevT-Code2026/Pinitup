import Workflow from "../models/Workflow.js";

/**
 * Validate that a slug contains only URL-safe characters.
 * @param {string} slug
 * @returns {boolean}
 */
function isValidSlug(slug) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

/**
 * Build a plain-object DTO from a workflow document.
 * @param {object} workflow
 * @returns {object}
 */
function toWorkflowDTO(workflow) {
  const obj = typeof workflow.toObject === "function" ? workflow.toObject() : workflow;
  return {
    id: obj._id,
    name: obj.name,
    slug: obj.slug,
    description: obj.description,
    provider: obj.provider,
    creditCost: obj.creditCost,
    status: obj.status,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
  };
}

const WorkflowService = {
  /**
   * Create a new workflow.
   *
   * @param {object} data - { name, slug, description, provider, creditCost, status }
   * @returns {object} The created workflow DTO.
   * @throws {Error} If slug is invalid, duplicate, or validation fails.
   */
  async createWorkflow(data) {
    if (!data.name || !data.name.trim()) {
      throw new Error("Workflow name is required");
    }

    if (!data.slug || !data.slug.trim()) {
      throw new Error("Workflow slug is required");
    }

    if (!isValidSlug(data.slug)) {
      throw new Error("Slug must contain only lowercase letters, numbers, and hyphens");
    }

    const existing = await Workflow.findOne({ slug: data.slug });
    if (existing) {
      throw new Error("A workflow with this slug already exists");
    }

    if (data.creditCost == null || data.creditCost < 0) {
      throw new Error("Credit cost is required and cannot be negative");
    }

    if (!Number.isInteger(data.creditCost)) {
      throw new Error("Credit cost must be an integer");
    }

    const workflow = await Workflow.create({
      name: data.name.trim(),
      slug: data.slug.trim().toLowerCase(),
      description: (data.description || "").trim(),
      provider: data.provider,
      creditCost: data.creditCost,
      status: data.status || "active",
    });

    return toWorkflowDTO(workflow);
  },

  /**
   * Update an existing workflow by ID.
   *
   * @param {string} id - The workflow's MongoDB ObjectId.
   * @param {object} data - Partial fields to update.
   * @returns {object} The updated workflow DTO.
   * @throws {Error} If not found, slug invalid/duplicate, or validation fails.
   */
  async updateWorkflow(id, data) {
    const workflow = await Workflow.findById(id);
    if (!workflow) {
      throw new Error("Workflow not found");
    }

    if (data.slug !== undefined && data.slug !== workflow.slug) {
      if (!data.slug || !data.slug.trim()) {
        throw new Error("Workflow slug cannot be empty");
      }

      if (!isValidSlug(data.slug)) {
        throw new Error("Slug must contain only lowercase letters, numbers, and hyphens");
      }

      const existing = await Workflow.findOne({ slug: data.slug, _id: { $ne: id } });
      if (existing) {
        throw new Error("A workflow with this slug already exists");
      }

      workflow.slug = data.slug.trim().toLowerCase();
    }

    if (data.name !== undefined) {
      if (!data.name || !data.name.trim()) {
        throw new Error("Workflow name cannot be empty");
      }
      workflow.name = data.name.trim();
    }

    if (data.description !== undefined) {
      workflow.description = data.description.trim();
    }

    if (data.provider !== undefined) {
      workflow.provider = data.provider;
    }

    if (data.creditCost !== undefined) {
      if (data.creditCost < 0) {
        throw new Error("Credit cost cannot be negative");
      }
      if (!Number.isInteger(data.creditCost)) {
        throw new Error("Credit cost must be an integer");
      }
      workflow.creditCost = data.creditCost;
    }

    if (data.status !== undefined) {
      workflow.status = data.status;
    }

    await workflow.save();
    return toWorkflowDTO(workflow);
  },

  /**
   * Get a workflow by its slug. Returns null if not found.
   *
   * @param {string} slug
   * @returns {object|null} Workflow DTO or null.
   */
  async getWorkflowBySlug(slug) {
    const workflow = await Workflow.findOne({ slug }).lean();
    if (!workflow) return null;
    return toWorkflowDTO(workflow);
  },

  /**
   * Get a workflow by its ID. Returns null if not found.
   *
   * @param {string} id
   * @returns {object|null} Workflow DTO or null.
   */
  async getWorkflowById(id) {
    const workflow = await Workflow.findById(id).lean();
    if (!workflow) return null;
    return toWorkflowDTO(workflow);
  },

  /**
   * Get all active workflows, sorted by name.
   *
   * @returns {object[]} Array of workflow DTOs.
   */
  async getAllActiveWorkflows() {
    const workflows = await Workflow.find({ status: "active" })
      .sort({ name: 1 })
      .lean();
    return workflows.map(toWorkflowDTO);
  },

  /**
   * Get all workflows (admin), sorted by createdAt descending.
   *
   * @returns {object[]} Array of workflow DTOs.
   */
  async getAllWorkflows() {
    const workflows = await Workflow.find()
      .sort({ createdAt: -1 })
      .lean();
    return workflows.map(toWorkflowDTO);
  },

  /**
   * Soft-delete a workflow by setting status to inactive.
   *
   * @param {string} id
   * @returns {object} The deactivated workflow DTO.
   * @throws {Error} If not found.
   */
  async deactivateWorkflow(id) {
    const workflow = await Workflow.findById(id);
    if (!workflow) {
      throw new Error("Workflow not found");
    }

    workflow.status = "inactive";
    await workflow.save();
    return toWorkflowDTO(workflow);
  },

  /**
   * Validate a slug string for URL safety.
   *
   * @param {string} slug
   * @returns {boolean}
   */
  validateSlug(slug) {
    return isValidSlug(slug);
  },
};

export default WorkflowService;
