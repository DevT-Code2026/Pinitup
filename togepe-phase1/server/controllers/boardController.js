import mongoose from "mongoose";
import Board from "../models/Board.js";

// POST /api/boards
export const createBoard = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Board name is required" });
    }

    const board = await Board.create({
      owner: req.user.id,
      name: name.trim(),
      description: description?.trim() || "",
    });

    return res.status(201).json({ board });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "A board with that name already exists" });
    }
    return res.status(500).json({ message: "Failed to create board", error: error.message });
  }
};

// GET /api/boards
export const getMyBoards = async (req, res) => {
  try {
    const boards = await Board.find({ owner: req.user.id })
      .sort({ updatedAt: -1 })
      .populate("savedContent", "mediaUrl title category")
      .lean();

    if (req.query.contentId) {
      const contentId = String(req.query.contentId);
      boards.forEach((board) => {
        board.isSaved = board.savedContent.some(
          (item) => String(item._id) === contentId
        );
      });
    }

    return res.status(200).json({ boards });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch boards", error: error.message });
  }
};

// GET /api/boards/:id
export const getBoardById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid board id" });
    }

    const board = await Board.findById(id)
      .populate("savedContent", "mediaUrl title description category prompt tags likesCount createdAt uploadedBy")
      .lean();

    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }

    if (String(board.owner) !== String(req.user.id)) {
      return res.status(403).json({ message: "Not authorized to view this board" });
    }

    return res.status(200).json({ board });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch board", error: error.message });
  }
};

// PUT /api/boards/:id
export const updateBoard = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid board id" });
    }

    const board = await Board.findById(id);

    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }

    if (String(board.owner) !== String(req.user.id)) {
      return res.status(403).json({ message: "Not authorized to update this board" });
    }

    if (name !== undefined) board.name = name.trim();
    if (description !== undefined) board.description = description.trim();

    await board.save();

    return res.status(200).json({ board });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "A board with that name already exists" });
    }
    return res.status(500).json({ message: "Failed to update board", error: error.message });
  }
};

// DELETE /api/boards/:id
export const deleteBoard = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid board id" });
    }

    const board = await Board.findById(id);

    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }

    if (String(board.owner) !== String(req.user.id)) {
      return res.status(403).json({ message: "Not authorized to delete this board" });
    }

    await board.deleteOne();

    return res.status(200).json({ message: "Board deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete board", error: error.message });
  }
};

// POST /api/boards/:id/save/:contentId
export const saveContentToBoard = async (req, res) => {
  try {
    const { id, contentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(contentId)) {
      return res.status(400).json({ message: "Invalid board or content id" });
    }

    const board = await Board.findById(id);

    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }

    if (String(board.owner) !== String(req.user.id)) {
      return res.status(403).json({ message: "Not authorized to modify this board" });
    }

    const alreadySaved = board.savedContent.some(
      (cid) => String(cid) === String(contentId)
    );

    if (alreadySaved) {
      return res.status(409).json({ message: "Prompt already saved to this board" });
    }

    board.savedContent.push(contentId);
    await board.save();

    return res.status(200).json({ message: "Prompt saved to board", savedContent: board.savedContent });
  } catch (error) {
    return res.status(500).json({ message: "Failed to save prompt to board", error: error.message });
  }
};

// DELETE /api/boards/:id/save/:contentId
export const removeContentFromBoard = async (req, res) => {
  try {
    const { id, contentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(contentId)) {
      return res.status(400).json({ message: "Invalid board or content id" });
    }

    const board = await Board.findById(id);

    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }

    if (String(board.owner) !== String(req.user.id)) {
      return res.status(403).json({ message: "Not authorized to modify this board" });
    }

    const idx = board.savedContent.findIndex(
      (cid) => String(cid) === String(contentId)
    );

    if (idx === -1) {
      return res.status(404).json({ message: "Prompt not found in this board" });
    }

    board.savedContent.splice(idx, 1);
    await board.save();

    return res.status(200).json({ message: "Prompt removed from board", savedContent: board.savedContent });
  } catch (error) {
    return res.status(500).json({ message: "Failed to remove prompt from board", error: error.message });
  }
};

// GET /api/boards/saved-ids
export const getSavedContentIds = async (req, res) => {
  try {
    const boards = await Board.find({ owner: req.user.id })
      .select("savedContent")
      .lean();

    const savedIds = [
      ...new Set(
        boards.flatMap((board) =>
          (board.savedContent || []).map((id) => String(id))
        )
      ),
    ];

    return res.status(200).json({ savedIds });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch saved content ids", error: error.message });
  }
};
