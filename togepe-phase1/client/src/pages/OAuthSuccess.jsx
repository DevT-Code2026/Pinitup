import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Landing page for the backend's redirect after a successful Google login:
// {CLIENT_URL}/oauth-success?token=<jwt>
// Stores the token exactly the way LoginPage's email/password flow does,
// then sends the user into the app.
function OAuthSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token);
      navigate("/", { replace: true });
    } else {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <p>Signing you in...</p>
    </div>
  );
}

export default OAuthSuccess;