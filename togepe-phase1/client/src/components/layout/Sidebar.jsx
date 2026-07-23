import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Compass,
  PlusSquare,
  FolderKanban,
  Settings,
  ChevronRight,
  X,
  Shield,
  Zap,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const baseMenuItems = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { title: "Explore", icon: Compass, path: "/" },
  { title: "Add Prompt", icon: PlusSquare, path: "/add-prompt" },
  { title: "Boards", icon: FolderKanban, path: "/boards" },
  { title: "Workflows", icon: Zap, path: "/workflows" },
  { title: "Settings", icon: Settings, path: "/settings" },
];

const adminItems = [
  { title: "Admin", icon: Shield, path: "/admin" },
  { title: "Admin Workflows", icon: Zap, path: "/admin/workflows" },
];

export default function Sidebar({ isOpen = true, onClose }) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const menuItems = isAdmin
    ? [...baseMenuItems.slice(0, 4), ...adminItems, ...baseMenuItems.slice(4)]
    : baseMenuItems;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial={{ x: -40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -40, opacity: 0 }}
          transition={{ duration: 0.25 }}
          style={{
            width: 260,
            background: "#ffffff",
            borderRight: "1px solid #E5E7EB",
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: 20,
            position: "sticky",
            top: 68,
          }}
        >
          <div>
            {onClose && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginBottom: 16,
                }}
              >
                <button
                  onClick={onClose}
                  aria-label="Close sidebar"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    border: "1px solid #E5E7EB",
                    background: "#F9FAFB",
                    color: "#5F6368",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            )}

            <div style={{ marginBottom: 24 }}>
              <div
                style={{
                  color: "#9CA3AF",
                  fontSize: 11,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  fontWeight: 600,
                  marginBottom: 8,
                }}
              >
                Navigation
              </div>
              <div
                style={{
                  color: "#111111",
                  fontWeight: 700,
                  fontSize: 18,
                }}
              >
                Workspace
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
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
                      padding: "11px 14px",
                      borderRadius: 10,
                      color: isActive ? "#111111" : "#5F6368",
                      background: isActive ? "#F3F4F6" : "transparent",
                      fontWeight: isActive ? 600 : 500,
                      fontSize: 14,
                      transition: "background 0.15s, color 0.15s",
                    })}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <Icon size={18} />
                      <span>{item.title}</span>
                    </div>
                    <ChevronRight size={14} color="#D1D5DB" />
                  </NavLink>
                );
              })}
            </div>
          </div>

          {/* Bottom card — removed dark purple upgrade card for clean white look */}
          <div
            style={{
              borderRadius: 12,
              padding: 16,
              background: "#F9FAFB",
              border: "1px solid #E5E7EB",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 13,
                color: "#767676",
                lineHeight: 1.5,
              }}
            >
              Built for creators who think in prompts.
            </p>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
