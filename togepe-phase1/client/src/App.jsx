import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import ErrorBoundary from "./components/ErrorBoundary.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import OAuthSuccess from "./pages/OAuthSuccess.jsx";
import AddPromptPage from "./pages/AddPromptPage.jsx";
import Dashboard from "./pages/Dashboard";
import Feed from "./pages/Feed";
import PromptDetail from "./pages/PromptDetail";
import Boards from "./pages/Boards";
import BoardDetail from "./pages/BoardDetail";

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/oauth-success" element={<OAuthSuccess />} />
          <Route
            path="/add-prompt"
            element={
              <ProtectedRoute>
                <AddPromptPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/feed"
            element={
              <ProtectedRoute>
                <Feed />
              </ProtectedRoute>
            }
          />
          <Route
            path="/prompt/:id"
            element={
              <ProtectedRoute>
                <PromptDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/boards"
            element={
              <ProtectedRoute>
                <Boards />
              </ProtectedRoute>
            }
          />
          <Route
            path="/boards/:id"
            element={
              <ProtectedRoute>
                <BoardDetail />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;