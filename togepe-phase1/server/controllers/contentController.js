import mongoose from "mongoose";
import Content from "../models/Content.js";
import { uploadBufferToCloudinary, deleteFromCloudinary } from "../config/cloudinary.js";

const ALLOWED_TYPES = new Set(["image", "video"]);
const GUEST_CONTENT_LIMIT = 5;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 50;

// Parses a comma-separated or JSON-array tags field from a multipart form
// body into a clean array of trimmed, non-empty strings.
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

// POST /api/content
// Expects: multipart/form-data — file field "media", plus body fields
// "prompt", "type" ("image"|"video"), optional "tags".
// Requires `protect` middleware upstream so req.user.id is available
// (wiring happens in Phase A4).
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

// GET /api/content?page=1&limit=20
// Public. Guests (no req.user, i.e. no valid JWT) are capped at the first
// GUEST_CONTENT_LIMIT items regardless of requested page/limit.
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

    const [items, total] = await Promise.all([
      Content.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(effectiveLimit)
        .populate("uploadedBy", "name")
        .lean(),
      isGuest ? Promise.resolve(GUEST_CONTENT_LIMIT) : Content.countDocuments(),
    ]);

    return res.status(200).json({
      content: items,
      guestLimited: isGuest,
      pagination: isGuest
        ? { total: Math.min(total, GUEST_CONTENT_LIMIT), page: 1, limit: effectiveLimit }
        : { total, page, limit },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch content", error: error.message });
  }
};

// GET /api/content/:id
// Public.
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

    return res.status(200).json({ content });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch content", error: error.message });
  }
};

// DELETE /api/content/:id
// Requires `protect` + `requireAdmin` middleware upstream (wiring happens
// in Phase A4). Removes the Cloudinary asset alongside the DB doc so no
// orphaned files are left behind.
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
        // Log and continue — a failed remote cleanup shouldn't block removing
        // the DB record, but it's worth surfacing for manual follow-up.
        console.error(`Failed to delete Cloudinary asset ${content.mediaPublicId}:`, cloudinaryError.message);
      }
    }

    await content.deleteOne();

    return res.status(200).json({ message: "Content deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete content", error: error.message });
  }
};