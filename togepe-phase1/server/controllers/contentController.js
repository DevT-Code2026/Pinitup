import mongoose from "mongoose";
import Content from "../models/Content.js";
import Board from "../models/Board.js";
import { uploadBufferToCloudinary, deleteFromCloudinary } from "../config/cloudinary.js";

import Like from "../models/Like.js";

const ALLOWED_TYPES = new Set(["image", "video"]);
const GUEST_CONTENT_LIMIT = 5;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 50;

const escapeRegex = (str) =>
  str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const attachLikedStatus = async (items, userId) => {
  if (!userId || !items.length) {
    return items.map((item) => ({ ...item, isLiked: false }));
  }

  const contentIds = items.map((item) => item._id);

  const likedDocs = await Like.find({
    user: userId,
    content: { $in: contentIds },
  })
    .select("content")
    .lean();

  const likedSet = new Set(likedDocs.map((doc) => String(doc.content)));

  return items.map((item) => ({
    ...item,
    isLiked: likedSet.has(String(item._id)),
  }));
};

const parseTags = (rawTags) => {
  if (!rawTags) return [];
  if (Array.isArray(rawTags)) {
    return rawTags.map((t) => String(t).trim()).filter(Boolean);
  }
  try {
    const parsed = JSON.parse(rawTags);
    if (Array.isArray(parsed)) {
      return parsed.map((t) => String(t).trim()).filter(Boolean);
    }
  } catch {
    // not JSON — fall through to comma-split
  }
  return String(rawTags)
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
};

// GET /api/content/categories
// Public. Returns distinct categories with prompt counts.
export const getCategories = async (req, res) => {
  try {
    const categories = await Content.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    return res.status(200).json({
      categories: categories.map((c) => ({
        name: c._id,
        count: c.count,
      })),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch categories", error: error.message });
  }
};

// GET /api/content?page=1&limit=20&search=...&category=...&sort=newest|oldest|popular|most_saved
// Public. Guests are capped at GUEST_CONTENT_LIMIT items.
export const getAllContent = async (req, res) => {
  try {
    const isGuest = !req.user?.id;

    let page = parseInt(req.query.page, 10);
    let limit = parseInt(req.query.limit, 10);

    if (!Number.isInteger(page) || page < 1) page = 1;
    if (!Number.isInteger(limit) || limit < 1) limit = DEFAULT_PAGE_SIZE;
    limit = Math.min(limit, MAX_PAGE_SIZE);

    const effectiveLimit = isGuest ? Math.min(limit, GUEST_CONTENT_LIMIT) : limit;
    const skip = isGuest ? 0 : (page - 1) * limit;

    const { search, category, sort } = req.query;

    const where = {};
    if (category && category !== "All") {
      where.category = category;
    }
    if (search && search.trim()) {
      const escaped = escapeRegex(search.trim());
      const regex = new RegExp(escaped, "i");
      where.$or = [
        { title: regex },
        { description: regex },
        { prompt: regex },
        { tags: regex },
      ];
    }

    let items;
    let total;

    if (sort === "most_saved") {
      const ids = await Content.distinct("_id", where);
      if (!ids.length) {
        return res.status(200).json({
          content: [],
          guestLimited: isGuest,
          pagination: { total: 0, page: 1, limit: effectiveLimit },
        });
      }

      const savedCounts = await Board.aggregate([
        { $unwind: "$savedContent" },
        { $match: { savedContent: { $in: ids } } },
        { $group: { _id: "$savedContent", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]);

      const countMap = new Map(savedCounts.map((d) => [String(d._id), d.count]));
      const sortedIds = [...ids].sort((a, b) => {
        const ca = countMap.get(String(a)) || 0;
        const cb = countMap.get(String(b)) || 0;
        return cb - ca;
      });

      total = sortedIds.length;
      const pageIds = sortedIds.slice(skip, skip + effectiveLimit);

      if (!pageIds.length) {
        return res.status(200).json({
          content: [],
          guestLimited: isGuest,
          pagination: { total, page, limit: effectiveLimit },
        });
      }

      const docs = await Content.find({ _id: { $in: pageIds } })
        .populate("uploadedBy", "name")
        .lean();

      const orderMap = new Map(pageIds.map((id, i) => [String(id), i]));
      items = docs
        .map((d) => ({ ...d, savedCount: countMap.get(String(d._id)) || 0 }))
        .sort((a, b) => orderMap.get(String(a._id)) - orderMap.get(String(b._id)));
    } else {
      let sortObj = { createdAt: -1 };
      if (sort === "oldest") sortObj = { createdAt: 1 };
      else if (sort === "popular") sortObj = { likesCount: -1 };

      const [found, countResult] = await Promise.all([
        Content.find(where)
          .sort(sortObj)
          .skip(skip)
          .limit(effectiveLimit)
          .populate("uploadedBy", "name")
          .lean(),
        isGuest ? Promise.resolve(GUEST_CONTENT_LIMIT) : Content.countDocuments(where),
      ]);

      items = found;
      total = countResult;
    }

    const enriched = await attachLikedStatus(items, req.user?.id || null);

    return res.status(200).json({
      content: enriched,
      guestLimited: isGuest,
      pagination: isGuest
        ? { total: Math.min(total, GUEST_CONTENT_LIMIT), page: 1, limit: effectiveLimit }
        : { total, page, limit },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch content", error: error.message });
  }
};

// POST /api/content
export const createContent = async (req, res) => {
  try {
    const { prompt, type, title, description, category } = req.body;
    const tags = parseTags(req.body.tags);

    if (!req.file) {
      return res.status(400).json({ message: "A media file is required" });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ message: "Prompt text is required" });
    }

    if (!category || !category.trim()) {
      return res.status(400).json({ message: "Category is required" });
    }

    if (!type || !ALLOWED_TYPES.has(type)) {
      return res.status(400).json({ message: "Type is required and must be 'image' or 'video'" });
    }

    if (!req.user?.id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    let uploadResult;
    try {
      uploadResult = await uploadBufferToCloudinary(req.file.buffer, {
        resourceType: type,
        folder: "pinitup",
      });
    } catch (uploadError) {
      return res.status(502).json({ message: "Media upload failed", error: uploadError.message });
    }

    const content = await Content.create({
      type,
      mediaUrl: uploadResult.secure_url,
      mediaPublicId: uploadResult.public_id,
      title: title.trim(),
      description: description?.trim() || "",
      category: category.trim(),
      prompt: prompt.trim(),
      tags,
      uploadedBy: req.user.id,
    });

    return res.status(201).json({ content });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create content", error: error.message });
  }
};

// GET /api/content/:id
export const getContentById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid content id" });
    }

    const content = await Content.findById(id).populate("uploadedBy", "name");

    if (!content) {
      return res.status(404).json({ message: "Content not found" });
    }

    const items = await attachLikedStatus([content.toObject()], req.user?.id || null);

    return res.status(200).json({ content: items[0] });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch content", error: error.message });
  }
};

// DELETE /api/content/:id
export const deleteContent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid content id" });
    }

    const content = await Content.findById(id);

    if (!content) {
      return res.status(404).json({ message: "Content not found" });
    }

    if (content.mediaPublicId) {
      try {
        await deleteFromCloudinary(content.mediaPublicId, content.type);
      } catch (cloudinaryError) {
        console.error(`Failed to delete Cloudinary asset ${content.mediaPublicId}:`, cloudinaryError.message);
      }
    }

    await content.deleteOne();

    return res.status(200).json({ message: "Content deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete content", error: error.message });
  }
};
