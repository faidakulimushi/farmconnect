import api from "./api";

export const userService = {
  getAll: (params) => api.get("/users", { params }),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  promoteToAdmin: (id) => api.put(`/users/${id}/promote`),
  demoteFromAdmin: (id) => api.put(`/users/${id}/demote`),
  updateRole: (id, role) => api.patch(`/users/${id}/role`, { role }),
  getStats: () => api.get("/users/stats"),
  getFarmerStats: () => api.get("/users/farmer-stats"),
  updateProfile: (data) => api.put("/auth/me", data),
  getMe: () => api.get("/auth/me"),
};
