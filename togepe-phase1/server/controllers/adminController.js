import User from "../models/User.js";
import Content from "../models/Content.js";
import Board from "../models/Board.js";

// GET /api/admin/stats
export const getAdminStats = async (req, res) => {
  try {
    const [totalUsers, totalPrompts, totalBoards] = await Promise.all([
      User.countDocuments(),
      Content.countDocuments(),
      Board.countDocuments(),
    ]);

    const recentActivity = await Content.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("uploadedBy", "name")
      .select("title createdAt uploadedBy category")
      .lean();

    return res.status(200).json({
      totalUsers,
      totalPrompts,
      totalBoards,
      recentActivity: recentActivity.map((item) => ({
        id: item._id,
        title: item.title,
        category: item.category,
        userName: item.uploadedBy?.name || "Unknown",
        createdAt: item.createdAt,
      })),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch admin stats", error: error.message });
  }
};
