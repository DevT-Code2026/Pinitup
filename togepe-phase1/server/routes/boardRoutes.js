import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  createBoard,
  getMyBoards,
  getBoardById,
  updateBoard,
  deleteBoard,
  saveContentToBoard,
  removeContentFromBoard,
  getSavedContentIds,
} from "../controllers/boardController.js";

const router = express.Router();

router.post("/", protect, createBoard);
router.get("/", protect, getMyBoards);
router.get("/saved-ids", protect, getSavedContentIds);
router.get("/:id", protect, getBoardById);
router.put("/:id", protect, updateBoard);
router.delete("/:id", protect, deleteBoard);
router.post("/:id/save/:contentId", protect, saveContentToBoard);
router.delete("/:id/save/:contentId", protect, removeContentFromBoard);

export default router;
