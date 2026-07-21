import { useEffect } from "react";

// Generic dismissible toast — used here for the Add Prompt form's
// success/error feedback, but not tied to that page's logic so it can be
// reused anywhere else in the app later.
function Toast({ message, type = "success", onClose, duration = 4000 }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const colors = {
    success: { bg: "#e6f7ed", border: "#34a853", text: "#1e7e3c" },
    error: { bg: "#fdecea", border: "#d93025", text: "#a50e0e" },
  };
  const c = colors[type] || colors.success;

  return (
    <div
      role="status"
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        minWidth: 260,
        maxWidth: 360,
        padding: "0.75rem 1rem",
        borderRadius: 8,
        border: `1px solid ${c.border}`,
        background: c.bg,
        color: c.text,
        boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: "0.75rem",
        fontFamily: "sans-serif",
        fontSize: "0.9rem",
        zIndex: 1000,
      }}
    >
      <span>{message}</span>
      <button
        onClick={onClose}
        aria-label="Dismiss"
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: c.text,
          fontWeight: "bold",
          lineHeight: 1,
        }}
      >
        ×
      </button>
    </div>
  );
}

export default Toast;