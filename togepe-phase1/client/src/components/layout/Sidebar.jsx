import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Compass,
  PlusSquare,
  FolderKanban,
  Settings,
  Sparkles,
  ChevronRight,
  X,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    title: "Explore",
    icon: Compass,
    path: "/feed",
  },
  {
    title: "Add Prompt",
    icon: PlusSquare,
    path: "/add-prompt",
  },
  {
    title: "Boards",
    icon: FolderKanban,
    path: "/boards",
  },
  {
    title: "Settings",
    icon: Settings,
    path: "/settings",
  },
];

export default function Sidebar({
  isOpen = true,
  onClose,
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial={{ x: -40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -40, opacity: 0 }}
          transition={{ duration: 0.25 }}
          style={{
            width: 270,
            background: "#17171C",
            borderRight: "1px solid rgba(255,255,255,0.06)",
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: 24,
            position: "sticky",
            top: 0,
          }}
        >
          <div>
            {/* Mobile Close */}

            {onClose && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginBottom: 18,
                }}
              >
                <button
                  onClick={onClose}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    border: "1px solid #2B2B35",
                    background: "#0B0B0F",
                    color: "white",
                    cursor: "pointer",
                  }}
                >
                  <X size={18} />
                </button>
              </div>
            )}

            {/* Heading */}

            <div
              style={{
                marginBottom: 32,
              }}
            >
              <div
                style={{
                  color: "#777",
                  fontSize: 12,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  marginBottom: 12,
                }}
              >
                Navigation
              </div>

              <div
                style={{
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 22,
                }}
              >
                Workspace
              </div>
            </div>

            {/* Links */}

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {menuItems.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    style={({ isActive }) => ({
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      textDecoration: "none",
                      padding: "14px 16px",
                      borderRadius: 14,
                      color: isActive ? "#fff" : "#B8B8C5",
                      background: isActive
                        ? "linear-gradient(135deg,#7C3AED,#6D28D9)"
                        : "transparent",
                      transition: "0.25s",
                    })}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                      }}
                    >
                      <Icon size={20} />
                      <span
                        style={{
                          fontWeight: 600,
                        }}
                      >
                        {item.title}
                      </span>
                    </div>

                    <ChevronRight size={16} />
                  </NavLink>
                );
              })}
            </div>
          </div>

          {/* Bottom Card */}

          <motion.div
            whileHover={{
              scale: 1.02,
            }}
            style={{
              borderRadius: 18,
              padding: 20,
              background:
                "linear-gradient(145deg,#7C3AED,#5B21B6)",
              color: "#fff",
            }}
          >
            <Sparkles
              size={26}
              style={{
                marginBottom: 12,
              }}
            />

            <h3
              style={{
                margin: 0,
                marginBottom: 8,
                fontSize: 18,
              }}
            >
              AI Pro
            </h3>

            <p
              style={{
                color: "rgba(255,255,255,.8)",
                fontSize: 14,
                lineHeight: 1.6,
                marginBottom: 18,
              }}
            >
              Unlock premium prompt collections,
              analytics and unlimited uploads.
            </p>

            <button
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: 12,
                border: "none",
                background: "#fff",
                color: "#5B21B6",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Upgrade
            </button>
          </motion.div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}