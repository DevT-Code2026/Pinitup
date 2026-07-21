import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api.js";

// No login page existed yet in the client (Phase B frontend work hasn't
// started). This is a minimal page: the existing email/password flow,
// wired to the existing /api/auth/login, plus the new Google button.
function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("/auth/login", { email, password });
      // Same storage key/format the rest of the app already expects.
      localStorage.setItem("token", res.data.token);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  const handleGoogleLogin = () => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
    // Full page redirect — this leaves the SPA and hits the backend's
    // redirect-based OAuth route directly, not an axios/api.js call.
    window.location.href = `${apiUrl}/auth/google`;
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: 360 }}>
      <h1>Log in</h1>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p style={{ color: "red", margin: 0 }}>{error}</p>}
        <button type="submit">Log in</button>
      </form>

      <div style={{ margin: "1rem 0", textAlign: "center" }}>or</div>

      <button onClick={handleGoogleLogin} type="button">
        Continue with Google
      </button>
    </div>
  );
}

export default LoginPage;