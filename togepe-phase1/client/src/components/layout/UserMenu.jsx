import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export default function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const displayName = user?.name || "User";
  const displayEmail = user?.email || "";

  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    displayName
  )}&background=111111&color=fff`;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleEscape = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open]);

  const handleLogout = () => {
    setOpen(false);
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div ref={menuRef} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: 0,
        }}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="User menu"
      >
        <img
          src={avatarUrl}
          alt={displayName}
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            border: "2px solid #E5E7EB",
            objectFit: "cover",
          }}
        />
        <ChevronDown
          size={14}
          color="#9CA3AF"
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "0.2s",
          }}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            role="menu"
            aria-label="User menu"
            style={{
              position: "absolute",
              right: 0,
              top: "calc(100% + 12px)",
              width: 220,
              background: "#ffffff",
              border: "1px solid #E5E7EB",
              borderRadius: 14,
              padding: 8,
              boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
              zIndex: 200,
            }}
          >
            <div
              style={{
                padding: "10px 12px",
                borderBottom: "1px solid #F3F4F6",
                marginBottom: 6,
              }}
            >
              <div
                style={{
                  color: "#111111",
                  fontWeight: 600,
                  fontSize: 14,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
                title={displayName}
              >
                {displayName}
              </div>
              {displayEmail && (
                <div
                  style={{
                    color: "#9CA3AF",
                    fontSize: 12,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                  title={displayEmail}
                >
                  {displayEmail}
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              role="menuitem"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                width: "100%",
                padding: "10px 12px",
                background: "transparent",
                border: "none",
                borderRadius: 10,
                color: "#DC2626",
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
                textAlign: "left",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#FEF2F2")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <LogOut size={16} />
              Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
