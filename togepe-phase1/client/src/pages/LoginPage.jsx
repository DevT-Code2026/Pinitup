import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import "./LoginPage.css";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  // If user already has a token, skip login and go straight to dashboard.
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      login(res.data.token, res.data.user);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
    window.location.href = `${apiUrl}/auth/google`;
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#0B0B0F",
      fontFamily: "sans-serif",
    }}>
      <div style={{
        width: "100%",
        maxWidth: 400,
        padding: "2.5rem",
        borderRadius: 20,
        background: "#17171C",
        border: "1px solid #2B2B35",
      }}>
        <h1 style={{ color: "#fff", margin: "0 0 0.5rem" }}>Welcome back</h1>
        <p style={{ color: "#888", margin: "0 0 1.5rem" }}>Log in to your Pinitup workspace</p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            className="login-input"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            className="login-input"
          />
          {error && (
            <p style={{
              color: "#F87171",
              margin: 0,
              padding: "10px 14px",
              borderRadius: 10,
              background: "rgba(248,113,113,0.1)",
              fontSize: 13,
            }}>
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "12px",
              borderRadius: 12,
              border: "none",
              background: loading ? "#4338CA99" : "linear-gradient(135deg,#7C3AED,#6D28D9)",
              color: "#fff",
              fontWeight: 600,
              fontSize: 14,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <div style={{ margin: "1.25rem 0", textAlign: "center", color: "#555", fontSize: 13 }}>or</div>

        <button
          onClick={handleGoogleLogin}
          type="button"
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: 12,
            border: "1px solid #2B2B35",
            background: "#0B0B0F",
            color: "#fff",
            fontWeight: 600,
            fontSize: 14,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          Continue with Google
        </button>
      </div>
    </div>
  );
}

export default LoginPage;