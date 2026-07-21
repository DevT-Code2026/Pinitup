import { useState } from "react";

// Reusable "type and press Enter to add a chip" tag input. Returns an
// array of strings via onChange — not tied to any specific form.
function TagInput({ tags, onChange, placeholder = "Add a tag and press Enter" }) {
  const [draft, setDraft] = useState("");

  const addTag = () => {
    const value = draft.trim();
    if (value && !tags.includes(value)) {
      onChange([...tags, value]);
    }
    setDraft("");
  };

  const removeTag = (tagToRemove) => {
    onChange(tags.filter((t) => t !== tagToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    } else if (e.key === "Backspace" && !draft && tags.length > 0) {
      // Quick-remove the last chip when backspacing on an empty input.
      onChange(tags.slice(0, -1));
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "0.4rem",
        border: "1px solid #ccc",
        borderRadius: 6,
        padding: "0.5rem",
      }}
    >
      {tags.map((tag) => (
        <span
          key={tag}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.3rem",
            background: "#eef1f5",
            borderRadius: 999,
            padding: "0.2rem 0.6rem",
            fontSize: "0.85rem",
          }}
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(tag)}
            aria-label={`Remove tag ${tag}`}
            style={{ background: "none", border: "none", cursor: "pointer", lineHeight: 1 }}
          >
            ×
          </button>
        </span>
      ))}
      <input
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addTag}
        placeholder={tags.length === 0 ? placeholder : ""}
        style={{ border: "none", outline: "none", flex: 1, minWidth: 120 }}
      />
    </div>
  );
}

export default TagInput;