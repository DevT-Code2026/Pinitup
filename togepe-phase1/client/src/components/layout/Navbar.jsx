import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Bell,
  Menu,
  Plus,
  Sparkles,
} from "lucide-react";
import { NavLink, useNavigate, useSearchParams } from "react-router-dom";
import UserMenu from "./UserMenu.jsx";

const navItems = [
  {
    name: "Dashboard",
    path: "/dashboard",
  },
  {
    name: "Explore",
    path: "/feed",
  },
  {
    name: "Add Prompt",
    path: "/add-prompt",
  },
];

export default function Navbar({
  onMenuClick,
}) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [navSearch, setNavSearch] = useState(
    () => searchParams.get("q") || ""
  );

  const handleNavSearchKeyDown = (e) => {
    if (e.key === "Enter" && !e.nativeEvent?.isComposing) {
      const q = navSearch.trim();
      if (q) navigate(`/feed?q=${encodeURIComponent(q)}`);
      else navigate("/feed");
    }
  };
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35 }}
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        backdropFilter: "blur(18px)",
        background: "rgba(11,11,15,0.75)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "16px 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "24px",
        }}
      >
        {/* Left */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "18px",
          }}
        >
          <button
            onClick={onMenuClick}
            aria-label="Open menu"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 42,
              height: 42,
              borderRadius: 12,
              border: "1px solid #2B2B35",
              background: "#17171C",
              color: "white",
              cursor: "pointer",
            }}
          >
            <Menu size={20} />
          </button>

          <NavLink
            to="/dashboard"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              textDecoration: "none",
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 14,
                background:
                  "linear-gradient(135deg,#7C3AED,#5B21B6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Sparkles
                size={20}
                color="white"
              />
            </div>

            <div>
              <div
                style={{
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 20,
                }}
              >
                Pinitup
              </div>

              <div
                style={{
                  color: "#888",
                  fontSize: 12,
                }}
              >
                AI Prompt Library
              </div>
            </div>
          </NavLink>
        </div>

        {/* Center */}

        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                textDecoration: "none",
                color: isActive
                  ? "#fff"
                  : "#9CA3AF",
                background: isActive
                  ? "#7C3AED"
                  : "transparent",
                padding: "10px 16px",
                borderRadius: 12,
                fontWeight: 600,
                transition: ".25s",
              })}
            >
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Right */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          {/* Search */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background: "#17171C",
              border: "1px solid #2B2B35",
              borderRadius: 14,
              padding: "10px 14px",
              width: 280,
            }}
          >
            <Search
              size={18}
              color="#888"
            />

            <input
              placeholder="Search prompts..."
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              onKeyDown={handleNavSearchKeyDown}
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                color: "white",
                fontSize: 14,
              }}
            />
          </div>

          <button
            aria-label="Notifications"
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              border: "1px solid #2B2B35",
              background: "#17171C",
              color: "white",
              cursor: "pointer",
            }}
          >
            <Bell size={18} />
          </button>

          <NavLink
            to="/add-prompt"
            style={{
              textDecoration: "none",
            }}
          >
            <motion.button
              whileHover={{
                scale: 1.04,
              }}
              whileTap={{
                scale: 0.96,
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                border: "none",
                background:
                  "linear-gradient(135deg,#7C3AED,#6D28D9)",
                color: "white",
                padding: "12px 18px",
                borderRadius: 14,
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              <Plus size={18} />
              Upload
            </motion.button>
          </NavLink>

          <UserMenu />
        </div>
      </div>
    </motion.header>
  );
}