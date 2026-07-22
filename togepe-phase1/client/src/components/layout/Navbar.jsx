import { useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Bell, MessageCircle, ChevronDown, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";

export default function Navbar({ searchQuery = "", onSearchChange }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const handleSignOut = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const handleLogoClick = (e) => {
    e.preventDefault();
    if (onSearchChange) onSearchChange("");
    navigate("/");
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>
        {/* Left — Logo */}
        <Link to="/" onClick={handleLogoClick} style={styles.logoLink}>
          <div style={styles.logoIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect width="24" height="24" rx="6" fill="#111" />
              <circle cx="12" cy="10" r="3" fill="white" />
              <path d="M8 18c0-2.2 1.8-4 4-4s4 1.8 4 4" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <span style={styles.logoText}>Pinitup</span>
        </Link>

        {/* Center — Search bar */}
        <div style={styles.searchWrap}>
          <Search size={18} color="#9CA3AF" style={{ flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Search prompts..."
            style={styles.searchInput}
            aria-label="Search prompts"
          />
        </div>

        {/* Right — Actions */}
        <div style={styles.right}>
          <Link to="/" style={styles.navLink}>
            Explore
          </Link>

          {isAuthenticated(user) && (
            <>
              <Link to="/boards" style={styles.navLink}>
                Boards
              </Link>
              <Link to="/add-prompt" style={styles.navLink}>
                Create
              </Link>
            </>
          )}

          {user?.role === "admin" && (
            <Link to="/admin" style={styles.navLink}>
              Admin
            </Link>
          )}

          <div style={styles.divider} />

          {isAuthenticated(user) ? (
            <>
              <button style={styles.iconBtn} aria-label="Notifications">
                <Bell size={20} color="#767676" />
              </button>
              <button style={styles.iconBtn} aria-label="Messages">
                <MessageCircle size={20} color="#767676" />
              </button>
              <Link to="/profile" style={styles.profileBtn}>
                <div style={styles.avatar}>
                  {getInitials(user?.name)}
                </div>
              </Link>
              <button onClick={handleSignOut} style={styles.signOutBtn}>
                <LogOut size={16} />
                Sign out
              </button>
            </>
          ) : (
            <Link to="/login" style={styles.loginLink}>
              Log in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

function isAuthenticated(user) {
  return Boolean(user);
}

function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const styles = {
  nav: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    background: "#fff",
    borderBottom: "1px solid #E5E7EB",
    height: 68,
    display: "flex",
    alignItems: "center",
  },
  inner: {
    width: "100%",
    maxWidth: 1400,
    margin: "0 auto",
    padding: "0 24px",
    display: "flex",
    alignItems: "center",
    height: "100%",
    gap: 16,
  },
  logoLink: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    textDecoration: "none",
    flexShrink: 0,
  },
  logoIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: 20,
    fontWeight: 700,
    color: "#111",
    letterSpacing: -0.5,
  },
  searchWrap: {
    flex: 1,
    maxWidth: 860,
    height: 42,
    background: "#F3F4F6",
    borderRadius: 999,
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "0 16px",
    marginLeft: 12,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    border: "none",
    background: "transparent",
    outline: "none",
    fontSize: 15,
    color: "#111",
    fontFamily: "inherit",
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    flexShrink: 0,
  },
  navLink: {
    padding: "8px 14px",
    fontSize: 15,
    fontWeight: 500,
    color: "#5F6368",
    textDecoration: "none",
    borderRadius: 24,
    transition: "background 0.15s, color 0.15s",
    whiteSpace: "nowrap",
  },
  divider: {
    width: 1,
    height: 24,
    background: "#E5E7EB",
    margin: "0 6px",
    flexShrink: 0,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    border: "none",
    background: "transparent",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "background 0.15s",
  },
  profileBtn: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "none",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "#111",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: 0.5,
  },
  signOutBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 16px",
    fontSize: 14,
    fontWeight: 500,
    color: "#5F6368",
    background: "#F3F4F6",
    border: "none",
    borderRadius: 24,
    cursor: "pointer",
    transition: "background 0.15s",
    whiteSpace: "nowrap",
  },
  loginLink: {
    padding: "10px 20px",
    fontSize: 14,
    fontWeight: 600,
    color: "#fff",
    background: "#111",
    textDecoration: "none",
    borderRadius: 24,
    whiteSpace: "nowrap",
  },
};
