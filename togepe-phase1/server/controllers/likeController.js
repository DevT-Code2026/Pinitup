import mongoose from "mongoose";
import Like from "../models/Like.js";
import Content from "../models/Content.js";

// POST /api/likes/:contentId
// Toggles a like for the authenticated user. If the user already liked
// this content the like is removed (unlike); otherwise a new like is
// created. The Content.likesCount denormalised counter is recalculated
// from the actual Like records to prevent drift from race conditions.
export const toggleLike = async (req, res) => {
  try {
    const { contentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(contentId)) {
      return res.status(400).json({ message: "Invalid content id" });
    }

    const content = await Content.findById(contentId);

    if (!content) {
      return res.status(404).json({ message: "Content not found" });
    }

    const existingLike = await Like.findOne({
      user: req.user.id,
      content: contentId,
    });

    let liked;

    if (existingLike) {
      await existingLike.deleteOne();
      liked = false;
    } else {
      await Like.create({ user: req.user.id, content: contentId });
      liked = true;
    }

    // Recalculate likesCount from actual Like records to prevent
    // drift caused by race conditions or double-clicks.
    content.likesCount = await Like.countDocuments({ content: contentId });
    await content.save();

    return res.status(200).json({ liked, likesCount: content.likesCount });
  } catch (error) {
    return res.status(500).json({ message: "Failed to toggle like", error: error.message });
  }
};
