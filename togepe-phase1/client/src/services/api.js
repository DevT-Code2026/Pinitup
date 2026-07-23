import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  console.error(
    "[Pinitup] VITE_API_URL is not set. " +
    "The app will fail to reach the backend in production. " +
    "Add VITE_API_URL to your Vercel environment variables."
  );
}

const api = axios.create({
  baseURL: API_URL || "http://localhost:5001/api",
});

// api.js no longer reads or writes localStorage directly — AuthContext is
// the single owner of auth state. AuthContext pushes the current token in
// via setAuthToken() (on load, login, and logout) and registers itself as
// the 401 handler via setUnauthorizedHandler(), so a failed request routes
// back through AuthContext.logout() instead of this module reaching into
// storage/window.location on its own.
let unauthorizedHandler = null;

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

export const setUnauthorizedHandler = (handler) => {
  unauthorizedHandler = handler;
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only trigger the unauthorized handler on 401 if:
    // 1. We're NOT already on the login page (avoid redirect loops)
    // 2. The failing request was NOT a login/register request (those handle their own errors)
    const isAuthPage = window.location.pathname === "/login" || window.location.pathname === "/";
    const isAuthRequest = error.config?.url?.includes("/auth/login") || error.config?.url?.includes("/auth/register");

    if (error.response?.status === 401 && !isAuthPage && !isAuthRequest) {
      unauthorizedHandler?.();
    }
    return Promise.reject(error);
  }
);

/* ── Workflow API ── */

export const getWorkflows = () => api.get("/workflows");
export const getWorkflow = (slug) => api.get(`/workflows/${slug}`);
export const uploadWorkflowImage = (coupleFile, memeFile) => {
  const formData = new FormData();
  formData.append("couple_image", coupleFile);
  formData.append("meme_image", memeFile);
  return api.post("/workflows/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
export const executeWorkflow = (slug, input = {}) =>
  api.post(`/workflows/${slug}/execute`, { input });

/* ── Admin Workflow API ── */

export const getAdminWorkflows = () => api.get("/admin/workflows");
export const createWorkflow = (data) => api.post("/admin/workflows", data);
export const updateWorkflow = (id, data) => api.put(`/admin/workflows/${id}`, data);
export const deactivateWorkflow = (id) => api.delete(`/admin/workflows/${id}`);

/* ── Wallet API ── */

export const getWallet = () => api.get("/wallet");

export const getWalletTransactions = (page = 1, limit = 20) =>
  api.get("/wallet/transactions", { params: { page, limit } });

/* ── Execution History API ── */

export const getExecutions = (page = 1, limit = 20) =>
  api.get("/executions", { params: { page, limit } });
export const getExecutionById = (id) => api.get(`/executions/${id}`);

export default api;