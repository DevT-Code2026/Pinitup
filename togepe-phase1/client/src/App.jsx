import { useEffect, useState } from "react";
import api from "./services/api.js";

function App() {
  const [status, setStatus] = useState("checking...");

  useEffect(() => {
    api
      .get("/auth/ping")
      .then((res) => setStatus(res.data.message))
      .catch(() => setStatus("API not reachable"));
  }, []);

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Togepe — Phase 1</h1>
      <p>Backend status: {status}</p>
    </div>
  );
}

export default App;
