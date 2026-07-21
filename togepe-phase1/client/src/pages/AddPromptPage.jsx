import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api.js";
import TagInput from "../components/TagInput.jsx";
import Toast from "../components/Toast.jsx";

const CATEGORY_OPTIONS = [
  "Portrait",
  "Landscape",
  "Illustration",
  "Photography",
  "3D Render",
  "Abstract",
  "UI/Product",
  "Other",
];

const EMPTY_FORM = {
  title: "",
  description: "",
  prompt: "",
  category: "",
};

function AddPromptPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [tags, setTags] = useState([]);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | submitting
  const [toast, setToast] = useState(null); // { message, type }

  // Client-side auth guard: this page needs a logged-in user (createContent
  // requires req.user.id). Role-based admin-only enforcement is still
  // deferred server-side per the earlier founder decision, so this just
  // checks "is anyone logged in," not "is this user an admin."
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    // Revoke the previous object URL when the file changes/unmounts, to
    // avoid leaking memory across repeated uploads in one session.
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFieldChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0] || null;
    setFile(selected);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(selected ? URL.createObjectURL(selected) : null);
  };

  const validate = () => {
    const errors = {};
    if (!form.title.trim()) errors.title = "Title is required";
    if (!form.prompt.trim()) errors.prompt = "Prompt text is required";
    if (!form.category) errors.category = "Category is required";
    if (!file) errors.file = "An image is required";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setTags([]);
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setFieldErrors({});
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setStatus("submitting");
    setToast(null);

    const formData = new FormData();
    formData.append("media", file);
    formData.append("type", "image"); // this form only supports image uploads for now
    formData.append("title", form.title.trim());
    formData.append("description", form.description.trim());
    formData.append("prompt", form.prompt.trim());
    formData.append("category", form.category);
    formData.append("tags", JSON.stringify(tags));

    try {
      await api.post("/content", formData);
      setToast({ message: "Prompt uploaded successfully.", type: "success" });
      resetForm();
    } catch (err) {
      const message = err.response?.data?.message || "Failed to upload prompt. Please try again.";
      setToast({ message, type: "error" });
    } finally {
      setStatus("idle");
    }
  };

  const isSubmitting = status === "submitting";

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "2rem", fontFamily: "sans-serif" }}>
      <h1 style={{ marginBottom: "0.25rem" }}>Add Prompt</h1>
      <p style={{ color: "#666", marginTop: 0 }}>Upload a new prompt for the Pinitup feed.</p>

      <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
        {/* Prompt Title */}
        <div>
          <label htmlFor="title" style={{ display: "block", fontWeight: 600, marginBottom: "0.3rem" }}>
            Prompt Title *
          </label>
          <input
            id="title"
            type="text"
            value={form.title}
            onChange={handleFieldChange("title")}
            placeholder="e.g. Cyberpunk city at dusk"
            style={{ width: "100%", padding: "0.5rem", borderRadius: 6, border: "1px solid #ccc" }}
          />
          {fieldErrors.title && <p style={{ color: "#d93025", fontSize: "0.85rem", margin: "0.25rem 0 0" }}>{fieldErrors.title}</p>}
        </div>

        {/* Prompt Description */}
        <div>
          <label htmlFor="description" style={{ display: "block", fontWeight: 600, marginBottom: "0.3rem" }}>
            Prompt Description
          </label>
          <textarea
            id="description"
            value={form.description}
            onChange={handleFieldChange("description")}
            placeholder="Optional short description shown to browsers"
            rows={2}
            style={{ width: "100%", padding: "0.5rem", borderRadius: 6, border: "1px solid #ccc", resize: "vertical" }}
          />
        </div>

        {/* Prompt Text */}
        <div>
          <label htmlFor="prompt" style={{ display: "block", fontWeight: 600, marginBottom: "0.3rem" }}>
            Prompt Text *
          </label>
          <textarea
            id="prompt"
            value={form.prompt}
            onChange={handleFieldChange("prompt")}
            placeholder="The actual prompt text users will copy"
            rows={4}
            style={{ width: "100%", padding: "0.5rem", borderRadius: 6, border: "1px solid #ccc", resize: "vertical" }}
          />
          {fieldErrors.prompt && <p style={{ color: "#d93025", fontSize: "0.85rem", margin: "0.25rem 0 0" }}>{fieldErrors.prompt}</p>}
        </div>

        {/* Tags */}
        <div>
          <label style={{ display: "block", fontWeight: 600, marginBottom: "0.3rem" }}>Tags</label>
          <TagInput tags={tags} onChange={setTags} />
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" style={{ display: "block", fontWeight: 600, marginBottom: "0.3rem" }}>
            Category *
          </label>
          <select
            id="category"
            value={form.category}
            onChange={handleFieldChange("category")}
            style={{ width: "100%", padding: "0.5rem", borderRadius: 6, border: "1px solid #ccc" }}
          >
            <option value="">Select a category</option>
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {fieldErrors.category && <p style={{ color: "#d93025", fontSize: "0.85rem", margin: "0.25rem 0 0" }}>{fieldErrors.category}</p>}
        </div>

        {/* Image Upload */}
        <div>
          <label htmlFor="media" style={{ display: "block", fontWeight: 600, marginBottom: "0.3rem" }}>
            Image *
          </label>
          <input
            id="media"
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
          {fieldErrors.file && <p style={{ color: "#d93025", fontSize: "0.85rem", margin: "0.25rem 0 0" }}>{fieldErrors.file}</p>}
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Preview"
              style={{ marginTop: "0.75rem", maxWidth: "100%", maxHeight: 240, borderRadius: 8, border: "1px solid #eee" }}
            />
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            padding: "0.7rem",
            borderRadius: 6,
            border: "none",
            background: isSubmitting ? "#999" : "#111",
            color: "#fff",
            fontWeight: 600,
            cursor: isSubmitting ? "not-allowed" : "pointer",
          }}
        >
          {isSubmitting ? "Uploading..." : "Upload Prompt"}
        </button>
      </form>

      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
    </div>
  );
}

export default AddPromptPage;