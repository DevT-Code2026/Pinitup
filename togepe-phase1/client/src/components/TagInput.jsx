import { useState } from "react";

function TagInput({ tags, onChange, placeholder = "Add a tag and press Enter" }) {
  const [draft, setDraft] = useState("");
  const [focused, setFocused] = useState(false);

  const addTag = () => {
    const value = draft.trim();
    if (value && !tags.some((t) => t.toLowerCase() === value.toLowerCase())) {
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
      onChange(tags.slice(0, -1));
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "0.4rem",
        border: focused ? "1px solid #4f46e5" : "1px solid #ccc",
        borderRadius: 6,
        padding: "0.5rem",
        boxShadow: focused ? "0 0 0 3px rgba(79, 70, 229, 0.15)" : "none",
        transition: "border-color 0.2s, box-shadow 0.2s",
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
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              lineHeight: 1,
              padding: "2px 4px",
              borderRadius: 4,
              fontSize: "0.9rem",
            }}
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
        onFocus={() => setFocused(true)}
        onBlur={() => { setFocused(false); addTag(); }}
        placeholder={tags.length === 0 ? placeholder : ""}
        aria-label="Add a tag"
        style={{ border: "none", outline: "none", flex: 1, minWidth: 120 }}
      />
    </div>
  );
}

export default TagInput;
