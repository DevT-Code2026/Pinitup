import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

// Landing page for the backend's redirect after a successful Google login:
// {CLIENT_URL}/oauth-success?token=<jwt>
// Passes the token through AuthContext so all components see the auth state.
function OAuthSuccess() {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      let user = null;

      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        user = {
          id: payload.id,
          name: payload.name,
          email: payload.email,
          role: payload.role,
        };
      } catch {
        // If decoding fails, user info will be null — AuthContext handles this.
      }

      login(token, user);
      navigate("/dashboard", { replace: true });
    } else {
      navigate("/login", { replace: true });
    }
  }, [login, navigate]);

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <p>Signing you in...</p>
    </div>
  );
}

export default OAuthSuccess;
