import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import api from "./services/api.js";

import LoginPage from "./pages/LoginPage.jsx";
import OAuthSuccess from "./pages/OAuthSuccess.jsx";
import AddPromptPage from "./pages/AddPromptPage.jsx";
import Dashboard from "./pages/Dashboard";



// Existing status-check placeholder
function StatusPage() {
  const [status, setStatus] = useState("checking...");

  useEffect(() => {
    api
      .get("/auth/ping")
      .then((res) => setStatus(res.data.message))
      .catch(() => setStatus("API not reachable"));
  }, []);

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Togepe – Phase 1</h1>
      <p>Backend status: {status}</p>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StatusPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/oauth-success" element={<OAuthSuccess />} />
        <Route path="/add-prompt" element={<AddPromptPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;