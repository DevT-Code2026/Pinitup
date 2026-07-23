import { useRef, useState, useEffect, useCallback } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Search,
  Bell,
  MessageCircle,
  LogOut,
  Menu,
  X,
  Compass,
  PlusSquare,
  FolderKanban,
  Shield,
  LayoutDashboard,
  Gem,
  Zap,
  History,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import "./Navbar.css";

export default function Navbar({ searchQuery = "", onSearchChange, onMenuClick }) {
  const { user, logout, credits, loadingWallet } = useAuth();
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const mobileInputRef = useRef(null);
  const drawerRef = useRef(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const isAuthenticated = Boolean(user);
  const isAdmin = user?.role === "admin";

  /* ── Handlers ── */
  const handleSignOut = () => {
    logout();
    setDrawerOpen(false);
    navigate("/login", { replace: true });
  };

  const handleLogoClick = (e) => {
    e.preventDefault();
    if (onSearchChange) onSearchChange("");
    navigate("/");
  };

  const openMobileSearch = () => {
    setMobileSearchOpen(true);
    setTimeout(() => mobileInputRef.current?.focus(), 50);
  };

  const closeMobileSearch = () => {
    setMobileSearchOpen(false);
    if (onSearchChange) onSearchChange("");
  };

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  /* ── Lock body scroll when drawer is open ── */
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  /* ── Escape key closes drawer ── */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (mobileSearchOpen) {
          closeMobileSearch();
        } else if (drawerOpen) {
          closeDrawer();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [drawerOpen, mobileSearchOpen, closeDrawer]);

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="navbar__inner">
        {/* ── Left — Logo ── */}
        <Link
          to="/"
          onClick={handleLogoClick}
          className="navbar__logo"
          aria-label="Pinitup home"
        >
          <div className="navbar__logo-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect width="24" height="24" rx="6" fill="#111" />
              <circle cx="12" cy="10" r="3" fill="white" />
              <path
                d="M8 18c0-2.2 1.8-4 4-4s4 1.8 4 4"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <span className="navbar__logo-text">Pinitup</span>
        </Link>

        {/* ── Center — Desktop search ── */}
        <div className="navbar__search">
          <Search size={18} color="#9CA3AF" style={{ flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Search prompts..."
            className="navbar__search-input"
            aria-label="Search prompts"
          />
        </div>

        {/* ── Right — Desktop actions ── */}
        <div className="navbar__right">
          <Link to="/" className="navbar__link">
            Explore
          </Link>

          {isAuthenticated && (
            <>
              <Link to="/boards" className="navbar__link">
                Boards
              </Link>
              <Link to="/add-prompt" className="navbar__link">
                Create
              </Link>
              <Link to="/workflows" className="navbar__link">
                Workflows
              </Link>
              <Link to="/executions" className="navbar__link">
                History
              </Link>
            </>
          )}

          {isAdmin && (
            <>
              <Link to="/admin" className="navbar__link">
                Admin
              </Link>
              <Link to="/admin/workflows" className="navbar__link">
                Manage
              </Link>
            </>
          )}

          {isAuthenticated && (
            <Link to="/wallet" className="navbar__credits">
              <Gem size={15} />
              {loadingWallet && credits === null ? (
                <span className="navbar__credits-skeleton" />
              ) : (
                <span className="navbar__credits-value">{credits ?? 0}</span>
              )}
            </Link>
          )}

          <div className="navbar__divider" />

          {isAuthenticated ? (
            <>
              <button
                className="navbar__icon-btn"
                aria-label="Notifications"
                type="button"
              >
                <Bell size={20} color="#767676" />
              </button>
              <button
                className="navbar__icon-btn"
                aria-label="Messages"
                type="button"
              >
                <MessageCircle size={20} color="#767676" />
              </button>
              <Link to="/profile" className="navbar__profile">
                <div className="navbar__avatar">{getInitials(user?.name)}</div>
              </Link>
              <button
                onClick={handleSignOut}
                className="navbar__signout"
                type="button"
              >
                <LogOut size={16} />
                Sign out
              </button>
            </>
          ) : (
            <Link to="/login" className="navbar__login">
              Log in
            </Link>
          )}
        </div>

        {/* ── Mobile — Search toggle ── */}
        <button
          className="navbar__search-toggle"
          onClick={openMobileSearch}
          aria-label="Open search"
          type="button"
        >
          <Search size={20} />
        </button>

        {/* ── Mobile — Hamburger ── */}
        <button
          className="navbar__hamburger"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open menu"
          type="button"
        >
          <Menu size={20} />
        </button>

        {/* ── Mobile — Expandable search bar ── */}
        <div
          className={`navbar__mobile-search ${
            mobileSearchOpen ? "navbar__mobile-search--open" : ""
          }`}
        >
          <Search size={18} color="#9CA3AF" style={{ flexShrink: 0 }} />
          <input
            ref={mobileInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Search prompts..."
            className="navbar__mobile-search-input"
            aria-label="Search prompts"
          />
          <button
            className="navbar__mobile-search-close"
            onClick={closeMobileSearch}
            aria-label="Close search"
            type="button"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* ── Mobile — Drawer overlay ── */}
      <div
        className={`navbar__drawer-overlay ${
          drawerOpen ? "navbar__drawer-overlay--open" : ""
        }`}
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* ── Mobile — Drawer ── */}
      <div
        ref={drawerRef}
        className={`navbar__drawer ${drawerOpen ? "navbar__drawer--open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <div className="navbar__drawer-header">
          <span className="navbar__drawer-title">Menu</span>
          <button
            className="navbar__drawer-close"
            onClick={closeDrawer}
            aria-label="Close menu"
            type="button"
          >
            <X size={16} />
          </button>
        </div>

        {/* Search inside drawer */}
        <div className="navbar__drawer-search">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              onSearchChange?.(e.target.value);
              if (e.target.value) {
                closeDrawer();
                navigate("/");
              }
            }}
            placeholder="Search prompts..."
            className="navbar__drawer-search-input"
            aria-label="Search prompts"
          />
        </div>

        <nav className="navbar__drawer-nav">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `navbar__drawer-link ${isActive ? "navbar__drawer-link--active" : ""}`
            }
            onClick={closeDrawer}
            end
          >
            <Compass size={18} />
            Explore
          </NavLink>

          {isAuthenticated && (
            <>
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `navbar__drawer-link ${isActive ? "navbar__drawer-link--active" : ""}`
                }
                onClick={closeDrawer}
              >
                <LayoutDashboard size={18} />
                Dashboard
              </NavLink>
              <NavLink
                to="/boards"
                className={({ isActive }) =>
                  `navbar__drawer-link ${isActive ? "navbar__drawer-link--active" : ""}`
                }
                onClick={closeDrawer}
              >
                <FolderKanban size={18} />
                Boards
              </NavLink>
              <NavLink
                to="/add-prompt"
                className={({ isActive }) =>
                  `navbar__drawer-link ${isActive ? "navbar__drawer-link--active" : ""}`
                }
                onClick={closeDrawer}
              >
                <PlusSquare size={18} />
                Create
              </NavLink>
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `navbar__drawer-link ${isActive ? "navbar__drawer-link--active" : ""}`
                }
                onClick={closeDrawer}
              >
                <div
                  className="navbar__avatar"
                  style={{ width: 18, height: 18, fontSize: 9 }}
                >
                  {getInitials(user?.name)}
                </div>
                Profile
              </NavLink>
              <NavLink
                to="/wallet"
                className={({ isActive }) =>
                  `navbar__drawer-link ${isActive ? "navbar__drawer-link--active" : ""}`
                }
                onClick={closeDrawer}
              >
                <Gem size={18} />
                Wallet
                {credits !== null && (
                  <span className="navbar__drawer-credits">{credits}</span>
                )}
              </NavLink>
              <NavLink
                to="/workflows"
                className={({ isActive }) =>
                  `navbar__drawer-link ${isActive ? "navbar__drawer-link--active" : ""}`
                }
                onClick={closeDrawer}
              >
                <Zap size={18} />
                Workflows
              </NavLink>
              <NavLink
                to="/executions"
                className={({ isActive }) =>
                  `navbar__drawer-link ${isActive ? "navbar__drawer-link--active" : ""}`
                }
                onClick={closeDrawer}
              >
                <History size={18} />
                Execution History
              </NavLink>
            </>
          )}

          {isAdmin && (
            <>
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `navbar__drawer-link ${isActive ? "navbar__drawer-link--active" : ""}`
                }
                onClick={closeDrawer}
              >
                <Shield size={18} />
                Admin
              </NavLink>
              <NavLink
                to="/admin/workflows"
                className={({ isActive }) =>
                  `navbar__drawer-link ${isActive ? "navbar__drawer-link--active" : ""}`
                }
                onClick={closeDrawer}
              >
                <Zap size={18} />
                Manage Workflows
              </NavLink>
            </>
          )}

          {isAuthenticated && (
            <>
              <div className="navbar__drawer-divider" />
              <button
                className="navbar__drawer-signout"
                onClick={handleSignOut}
                type="button"
              >
                <LogOut size={18} />
                Sign out
              </button>
            </>
          )}

          {!isAuthenticated && (
            <>
              <div className="navbar__drawer-divider" />
              <Link
                to="/login"
                className="navbar__drawer-login"
                onClick={closeDrawer}
              >
                Log in
              </Link>
            </>
          )}
        </nav>

        <div className="navbar__drawer-footer">
          <p className="navbar__drawer-footer-text">
            Built for creators who think in prompts.
          </p>
        </div>
      </div>
    </nav>
  );
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
