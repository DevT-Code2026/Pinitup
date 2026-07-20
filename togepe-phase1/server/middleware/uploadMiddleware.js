import multer from "multer";

// Memory storage: file arrives as a Buffer on req.file.buffer, never touches
// local disk. The buffer is streamed straight to Cloudinary in the
// controller (Phase A3), which keeps this stateless and safe for
// ephemeral hosts like Render.
const storage = multer.memoryStorage();

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/quicktime",
  "video/webm",
]);

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    return cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed: jpg, png, webp, gif, mp4, mov, webm.`));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
    files: 1,
  },
});

// Express error-handling wrapper: multer errors (bad mimetype, file too
// large) throw synchronously inside its own middleware, not as a normal
// Express "next(err)" call from route code, so they need to be caught here
// and turned into a clean JSON response instead of an unhandled 500/crash.
export const handleUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "File too large. Maximum size is 10MB." });
    }
    return res.status(400).json({ message: `Upload error: ${err.message}` });
  }
  if (err) {
    return res.status(400).json({ message: err.message || "File upload failed" });
  }
  next();
};

export default upload;