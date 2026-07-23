import User from "../models/User.js";
import CreditTransaction from "../models/CreditTransaction.js";
import { TransactionTypes, SIGNUP_BONUS } from "../utils/transactionTypes.js";

const SIGNUP_BONUS_AMOUNT = 20;

/**
 * Build a plain-object DTO from a user document.
 * @param {object} user
 * @returns {{ id: string, credits: number }}
 */
function toWalletDTO(user) {
  return { credits: user.credits };
}

const CreditService = {
  /**
   * Add credits to a user's wallet.
   * Creates a CreditTransaction recording balanceBefore → balanceAfter.
   *
   * @param {string} userId - The user's MongoDB ObjectId.
   * @param {number} amount - Positive number of credits to add.
   * @param {string} type - One of TransactionTypes values.
   * @param {object} [options]
   * @param {string} [options.reference] - Unique reference for the transaction.
   * @param {string} [options.description] - Human-readable description.
   * @param {object} [options.metadata] - Arbitrary metadata to store.
   * @returns {{ wallet: { credits: number }, transaction: object }}
   * @throws {Error} If amount is not positive or user not found.
   */
  async addCredits(userId, amount, type, options = {}) {
    if (amount <= 0) {
      throw new Error("Amount must be positive");
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const balanceBefore = user.credits;
    user.credits += amount;
    await user.save();

    const tx = await CreditTransaction.create({
      user: userId,
      type,
      amount,
      balanceBefore,
      balanceAfter: user.credits,
      reference: options.reference || null,
      description: options.description || null,
      metadata: options.metadata || {},
    });

    return { wallet: toWalletDTO(user), transaction: tx.toObject() };
  },

  /**
   * Deduct credits from a user's wallet.
   * Rejects if balance is insufficient.
   * Creates a CreditTransaction recording balanceBefore → balanceAfter.
   *
   * @param {string} userId - The user's MongoDB ObjectId.
   * @param {number} amount - Positive number of credits to deduct.
   * @param {string} type - One of TransactionTypes values.
   * @param {object} [options]
   * @param {string} [options.reference] - Unique reference for the transaction.
   * @param {string} [options.description] - Human-readable description.
   * @param {object} [options.metadata] - Arbitrary metadata to store.
   * @returns {{ wallet: { credits: number }, transaction: object }}
   * @throws {Error} If amount is not positive, user not found, or insufficient credits.
   */
  async deductCredits(userId, amount, type, options = {}) {
    if (amount <= 0) {
      throw new Error("Amount must be positive");
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    if (user.credits < amount) {
      throw new Error("Insufficient credits");
    }

    const balanceBefore = user.credits;
    user.credits -= amount;
    await user.save();

    const tx = await CreditTransaction.create({
      user: userId,
      type,
      amount: -amount,
      balanceBefore,
      balanceAfter: user.credits,
      reference: options.reference || null,
      description: options.description || null,
      metadata: options.metadata || {},
    });

    return { wallet: toWalletDTO(user), transaction: tx.toObject() };
  },

  /**
   * Get the current wallet balance for a user.
   *
   * @param {string} userId - The user's MongoDB ObjectId.
   * @returns {{ credits: number }}
   * @throws {Error} If user not found.
   */
  async getWallet(userId) {
    const user = await User.findById(userId).select("credits");
    if (!user) {
      throw new Error("User not found");
    }
    return toWalletDTO(user);
  },

  /**
   * Get paginated transaction history for a user, newest first.
   *
   * @param {string} userId - The user's MongoDB ObjectId.
   * @param {object} [options]
   * @param {number} [options.page=1] - Page number (1-indexed).
   * @param {number} [options.limit=20] - Results per page.
   * @returns {{ transactions: object[], pagination: { page: number, limit: number, total: number, pages: number } }}
   */
  async getTransactions(userId, options = {}) {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      CreditTransaction.find({ user: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      CreditTransaction.countDocuments({ user: userId }),
    ]);

    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  },

  /**
   * Award the signup bonus to a new user.
   * Wrapper around addCredits — does not duplicate logic.
   *
   * @param {string} userId - The user's MongoDB ObjectId.
   * @returns {{ wallet: { credits: number }, transaction: object }}
   * @throws {Error} If user not found.
   */
  async awardSignupBonus(userId) {
    return this.addCredits(userId, SIGNUP_BONUS_AMOUNT, SIGNUP_BONUS, {
      description: "Signup Bonus",
    });
  },
};

export default CreditService;
