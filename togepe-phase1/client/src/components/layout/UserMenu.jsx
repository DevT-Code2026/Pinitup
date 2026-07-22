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
  )}&background=7C3AED&color=fff`;

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
          gap: "8px",
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
            width: 44,
            height: 44,
            borderRadius: "50%",
            border: "2px solid #7C3AED",
            objectFit: "cover",
          }}
        />

        <ChevronDown
          size={16}
          color="#888"
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
              background: "#17171C",
              border: "1px solid #2B2B35",
              borderRadius: 14,
              padding: "8px",
              boxShadow: "0 12px 32px rgba(0,0,0,0.4)",
              zIndex: 200,
            }}
          >
            <div
              style={{
                padding: "10px 12px",
                borderBottom: "1px solid #2B2B35",
                marginBottom: "6px",
              }}
            >
              <div
                style={{
                  color: "#fff",
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
                    color: "#888",
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
                gap: "10px",
                width: "100%",
                padding: "10px 12px",
                background: "transparent",
                border: "none",
                borderRadius: 10,
                color: "#F87171",
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
                textAlign: "left",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(248,113,113,0.1)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <LogOut size={16} />
              Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
