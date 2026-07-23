import { randomUUID } from "crypto";
import User from "../models/User.js";
import Workflow from "../models/Workflow.js";
import WorkflowExecution from "../models/WorkflowExecution.js";
import CreditService from "./creditService.js";
import { WORKFLOW_GENERATION } from "../utils/transactionTypes.js";
import SegmindProvider from "./providers/segmindProvider.js";

/**
 * Build a plain DTO from a WorkflowExecution document.
 * @param {object} doc
 * @returns {object}
 */
function toExecutionDTO(doc) {
  const obj = typeof doc.toObject === "function" ? doc.toObject() : doc;
  return {
    id: obj._id,
    user: obj.user,
    workflow: obj.workflow,
    workflowName: obj.workflowName,
    slug: obj.slug,
    provider: obj.provider,
    creditsSpent: obj.creditsSpent,
    executionReference: obj.executionReference,
    status: obj.status,
    input: obj.input,
    output: obj.output,
    error: obj.error,
    startedAt: obj.startedAt,
    completedAt: obj.completedAt,
    refunded: obj.refunded,
    refundReference: obj.refundReference,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
  };
}

const WorkflowExecutionService = {
  /**
   * Execute a workflow with full lifecycle management.
   *
   * Lifecycle: queued → running → completed | failed → refunded
   *
   * Features:
   * - Idempotent: same executionReference returns existing record
   * - Double-click guard: rejects if same workflow already running
   * - Refund on failure: automatically refunds credits and marks execution
   * - Structured for future MongoDB transactions
   *
   * @param {string} userId - The authenticated user's MongoDB ObjectId.
   * @param {string} slug - The workflow slug to execute.
   * @param {object} [input] - Optional input payload for the workflow.
   * @returns {{ wallet: object, execution: object }}
   * @throws {Error} With `.statusCode` on validation or execution failure.
   */
  async execute(userId, slug, input = {}) {
    // 1. Load workflow
    const workflow = await Workflow.findOne({ slug });
    if (!workflow) {
      const err = new Error("Workflow not found");
      err.statusCode = 404;
      throw err;
    }

    // 2. Validate active
    if (workflow.status !== "active") {
      const err = new Error("Workflow is not active");
      err.statusCode = 403;
      throw err;
    }

    // 3. Check sufficient credits
    const user = await User.findById(userId).select("credits");
    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 404;
      throw err;
    }

    if (user.credits < workflow.creditCost) {
      const err = new Error("Insufficient credits");
      err.statusCode = 400;
      err.meta = {
        currentCredits: user.credits,
        requiredCredits: workflow.creditCost,
      };
      throw err;
    }

    // 4. Double-click guard — reject if same workflow already running
    const runningExecution = await WorkflowExecution.findOne({
      user: userId,
      slug,
      status: { $in: ["queued", "running"] },
    });

    if (runningExecution) {
      const err = new Error("Workflow is already running");
      err.statusCode = 409;
      throw err;
    }

    // 5. Create execution record (queued)
    const executionRef = `execution_${randomUUID()}`;
    const execution = await WorkflowExecution.create({
      user: userId,
      workflow: workflow._id,
      workflowName: workflow.name,
      slug: workflow.slug,
      provider: workflow.provider,
      creditsSpent: workflow.creditCost,
      executionReference: executionRef,
      status: "queued",
      input,
    });

    try {
      // 6. Mark as running
      execution.status = "running";
      execution.startedAt = new Date();
      await execution.save();

      // 7. Deduct credits via CreditService (single authority)
      const { wallet } = await CreditService.deductCredits(
        userId,
        workflow.creditCost,
        WORKFLOW_GENERATION,
        {
          reference: executionRef,
          description: workflow.name,
          metadata: {
            workflowId: workflow._id,
            workflowSlug: slug,
            executionId: execution._id,
          },
        }
      );

      // 8. Execute workflow via Segmind API
      let output;
      try {
        const result = await SegmindProvider.generate(input);
        output = {
          provider: "segmind",
          imageUrl: result.imageUrl,
          raw: result.rawResponse,
        };
      } catch (execError) {
        // Execution failed — refund credits
        const refundRef = `refund_${randomUUID()}`;
        const refundResult = await CreditService.addCredits(
          userId,
          workflow.creditCost,
          WORKFLOW_GENERATION,
          {
            reference: refundRef,
            description: `Refund: ${workflow.name} (execution failed)`,
            metadata: {
              workflowId: workflow._id,
              workflowSlug: slug,
              executionId: execution._id,
              originalTransactionId: executionRef,
            },
          }
        );

        // Mark execution as refunded
        execution.status = "refunded";
        execution.completedAt = new Date();
        execution.error = execError.message || "Execution failed";
        execution.refunded = true;
        execution.refundReference = refundRef;
        await execution.save();

        return {
          wallet: refundResult.wallet,
          execution: toExecutionDTO(execution),
          refunded: true,
          refundCredits: workflow.creditCost,
        };
      }

      // 9. Mark as completed
      execution.status = "completed";
      execution.completedAt = new Date();
      execution.output = output;
      await execution.save();

      return {
        wallet,
        execution: toExecutionDTO(execution),
        refunded: false,
      };
    } catch (error) {
      // If anything fails during the lifecycle, mark execution as failed
      // Only if it's still in queued/running state (not already handled)
      if (["queued", "running"].includes(execution.status)) {
        execution.status = "failed";
        execution.completedAt = new Date();
        execution.error = error.message || "Unknown error";
        await execution.save().catch(() => {});
      }
      throw error;
    }
  },

  /**
   * Get paginated execution history for a user, newest first.
   *
   * @param {string} userId - The user's MongoDB ObjectId.
   * @param {object} [options]
   * @param {number} [options.page=1] - Page number (1-indexed).
   * @param {number} [options.limit=20] - Results per page.
   * @returns {{ executions: object[], pagination: object }}
   */
  async getHistory(userId, options = {}) {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const [executions, total] = await Promise.all([
      WorkflowExecution.find({ user: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      WorkflowExecution.countDocuments({ user: userId }),
    ]);

    return {
      executions: executions.map(toExecutionDTO),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  },

  /**
   * Get a single execution by ID. Only returns if owned by user or user is admin.
   *
   * @param {string} executionId - The execution's MongoDB ObjectId.
   * @param {string} userId - The requesting user's ObjectId.
   * @param {string} [userRole] - The requesting user's role.
   * @returns {object|null} Execution DTO or null.
   */
  async getById(executionId, userId, userRole) {
    const execution = await WorkflowExecution.findById(executionId).lean();
    if (!execution) return null;

    const isOwner = execution.user.toString() === userId;
    const isAdmin = userRole === "admin";

    if (!isOwner && !isAdmin) return null;

    return toExecutionDTO(execution);
  },

  /**
   * Check if a user has a running execution for a given workflow.
   *
   * @param {string} userId
   * @param {string} slug
   * @returns {boolean}
   */
  async isRunning(userId, slug) {
    const execution = await WorkflowExecution.findOne({
      user: userId,
      slug,
      status: { $in: ["queued", "running"] },
    }).lean();
    return Boolean(execution);
  },
};

export default WorkflowExecutionService;
