import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// Set auth header immediately from localStorage on app load
const _token = localStorage.getItem("agrilink_token");
if (_token) {
  api.defaults.headers.common["Authorization"] = `Bearer ${_token}`;
}

/** Returns true when the response is NOT from our Express backend */
const isNotBackend = (error) => {
  if (!error.response) return true; // network error / timeout
  const data = error.response.data;
  // HTML page returned (Vercel catch-all or 404 page)
  if (typeof data === "string" && data.trim().startsWith("<")) return true;
  // Vercel JSON 404 – has "error" key but no "success" key
  if (data && typeof data === "object" && data.error && data.success === undefined) return true;
  // Any non-JSON content-type
  const ct = error.response.headers?.["content-type"] || "";
  if (!ct.includes("application/json")) return true;
  return false;
};

api.interceptors.response.use(
  (response) => {
    // Success but body is HTML → backend not reachable
    if (typeof response.data === "string" && response.data.trim().startsWith("<")) {
      return Promise.reject(
        Object.assign(new Error("Cannot connect to server. Please try again later."), {
          isNotBackend: true,
        })
      );
    }
    return response;
  },
  (error) => {
    if (isNotBackend(error)) {
      return Promise.reject(
        Object.assign(new Error("Cannot connect to server. Please try again later."), {
          isNotBackend: true,
        })
      );
    }
    if (error.response?.status === 401) {
      delete api.defaults.headers.common["Authorization"];
      localStorage.removeItem("agrilink_token");
      localStorage.removeItem("agrilink_user");
    }
    return Promise.reject(error);
  }
);

export default api;
