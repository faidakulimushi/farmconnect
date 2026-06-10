import axios from "axios";

/**
 * Pre-configured Axios instance.
 * In development, requests go to /api (proxied by Vite to localhost:5000).
 * In production (Vercel), VITE_API_URL must be set to the Render backend URL,
 * e.g. https://agrilink-backend.onrender.com/api
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: { "Content-Type": "application/json" },
});

// Set auth header immediately from localStorage on app load
const _token = localStorage.getItem("agrilink_token");
if (_token) {
  api.defaults.headers.common["Authorization"] = `Bearer ${_token}`;
}

// Response interceptor – surface backend error messages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear stale credentials but do NOT hard-redirect –
      // let React Router / ProtectedRoute handle the redirect gracefully.
      delete api.defaults.headers.common["Authorization"];
      localStorage.removeItem("agrilink_token");
      localStorage.removeItem("agrilink_user");
    }
    return Promise.reject(error);
  }
);

export default api;
