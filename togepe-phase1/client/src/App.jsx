import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import ErrorBoundary from "./components/ErrorBoundary.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminRoute from "./components/AdminRoute.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import OAuthSuccess from "./pages/OAuthSuccess.jsx";
import AddPromptPage from "./pages/AddPromptPage.jsx";
import Dashboard from "./pages/Dashboard";
import Feed from "./pages/Feed";
import PromptDetail from "./pages/PromptDetail";
import Boards from "./pages/Boards";
import BoardDetail from "./pages/BoardDetail";
import AdminPage from "./pages/AdminPage.jsx";
import Wallet from "./pages/Wallet.jsx";
import Workflows from "./pages/Workflows.jsx";
import AdminWorkflows from "./pages/AdminWorkflows.jsx";

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Feed />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/oauth-success" element={<OAuthSuccess />} />
          <Route path="/prompt/:id" element={<PromptDetail />} />
          <Route path="/workflows" element={<Workflows />} />

          {/* Auth required */}
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
          <Route
            path="/wallet"
            element={
              <ProtectedRoute>
                <Wallet />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin only */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/workflows"
            element={
              <AdminRoute>
                <AdminWorkflows />
              </AdminRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
