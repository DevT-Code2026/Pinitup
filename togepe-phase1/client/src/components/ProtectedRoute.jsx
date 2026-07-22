import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

// The single source of truth for route protection. Individual pages no
// longer run their own "redirect if no token" checks — this wraps
// whichever routes need a logged-in user.
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  // Auth state loads synchronously from localStorage on mount, but that
  // still happens after the first render — this avoids a false redirect
  // to /login during the one-tick window before it's read.
  if (loading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}