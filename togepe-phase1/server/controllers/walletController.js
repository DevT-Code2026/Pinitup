import CreditService from "../services/creditService.js";

export const getWallet = async (req, res) => {
  try {
    const wallet = await CreditService.getWallet(req.user.id);
    res.json(wallet);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch wallet", error: error.message });
  }
};

export const getTransactionHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;

    const result = await CreditService.getTransactions(req.user.id, { page, limit });
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch transactions", error: error.message });
  }
};
