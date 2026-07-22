import express from "express";
import protect from "../middleware/authMiddleware.js";
import requireAdmin from "../middleware/roleMiddleware.js";
import { getAdminStats } from "../controllers/adminController.js";

const router = express.Router();

router.get("/stats", protect, requireAdmin, getAdminStats);

export default router;
