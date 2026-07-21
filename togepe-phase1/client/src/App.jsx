import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import ErrorBoundary from "./components/ErrorBoundary.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import OAuthSuccess from "./pages/OAuthSuccess.jsx";
import AddPromptPage from "./pages/AddPromptPage.jsx";
import Dashboard from "./pages/Dashboard";
import Feed from "./pages/Feed";

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/oauth-success" element={<OAuthSuccess />} />
          <Route path="/add-prompt" element={<AddPromptPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/feed" element={<Feed />} />
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;