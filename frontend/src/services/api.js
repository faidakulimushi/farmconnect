import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: { "Content-Type": "application/json" },
  timeout: 15000, // 15 second timeout
});

// Set auth header immediately from localStorage on app load
const _token = localStorage.getItem("agrilink_token");
if (_token) {
  api.defaults.headers.common["Authorization"] = `Bearer ${_token}`;
}

// Response interceptor – surface backend error messages
api.interceptors.response.use(
  (response) => {
    // If the response body is HTML (Vercel caught the request instead of backend),
    // convert it into a proper error so catch blocks handle it correctly
    if (
      typeof response.data === "string" &&
      response.data.trim().startsWith("<")
    ) {
      return Promise.reject(
        Object.assign(new Error("Cannot connect to server. Please try again later."), {
          isHtmlResponse: true,
        })
      );
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      delete api.defaults.headers.common["Authorization"];
      localStorage.removeItem("agrilink_token");
      localStorage.removeItem("agrilink_user");
    }
    return Promise.reject(error);
  }
);

export default api;
