import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

// Load env vars before configuring Cloudinary. This is necessary because
// ES module imports are hoisted — cloudinary.js executes before
// dotenv.config() in server.js runs, so without this the env vars would
// be undefined when cloudinary.config() is called below.
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Uploads a file buffer to Cloudinary via an upload stream (no temp files
 * written to disk). Resolves with the Cloudinary result, which includes
 * secure_url (the mediaUrl to store on the Content doc) and public_id
 * (needed later to delete the asset when the content is removed).
 *
 * @param {Buffer} buffer - raw file buffer from multer memory storage
 * @param {Object} options
 * @param {"image"|"video"} options.resourceType - Cloudinary resource_type
 * @param {string} [options.folder="pinitup"] - Cloudinary folder to store the asset in
 * @returns {Promise<import("cloudinary").UploadApiResponse>}
 */
export const uploadBufferToCloudinary = (buffer, { resourceType = "image", folder = "pinitup" } = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: resourceType,
        folder,
      },
      (error, result) => {
  console.log("Cloudinary Error:", error);
  console.log("Cloudinary Result:", result);

  if (error) return reject(error);
  resolve(result);
}
    );

    uploadStream.end(buffer);
  });
};

/**
 * Deletes a previously uploaded asset from Cloudinary by its public_id.
 * Used by deleteContent (Phase A3) so removing a Content doc doesn't leave
 * an orphaned file sitting in Cloudinary storage.
 *
 * @param {string} publicId
 * @param {"image"|"video"} resourceType
 */
export const deleteFromCloudinary = (publicId, resourceType = "image") => {
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
};

export default cloudinary;