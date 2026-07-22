import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { setAuthToken, setUnauthorizedHandler } from "../services/api.js";

const AuthContext = createContext(null);

// The only place in the app that reads or writes token/user to
// localStorage. Every other component consumes auth state through
// useAuth() instead of touching localStorage or api.js directly.
export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load whatever was persisted from a previous session on first mount.
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    let storedUser = null;

    try {
      storedUser = JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      storedUser = null;
    }

    if (storedToken) {
      setToken(storedToken);
      setAuthToken(storedToken);
    }

    if (storedUser) {
      setUser(storedUser);
    }

    setLoading(false);
  }, []);

  const login = (newToken, newUser) => {
    localStorage.setItem("token", newToken);
    if (newUser) {
      localStorage.setItem("user", JSON.stringify(newUser));
    }

    setAuthToken(newToken);
    setToken(newToken);
    setUser(newUser || null);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setAuthToken(null);
    setToken(null);
    setUser(null);
  };

  // Registered once so api.js's response interceptor can route a 401
  // back into AuthContext, instead of api.js touching storage itself.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      logout();
      window.location.href = "/login";
    });
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      loading,
      login,
      logout,
    }),
    [user, token, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}