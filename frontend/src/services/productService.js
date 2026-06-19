import api from "./api";

export const productService = {
  getAll: (params) => api.get("/products", { params }),
  getAdminAll: (params) => api.get("/products/admin/all", { params }),
  getById: (id) => api.get(`/products/${id}`),
  getFeatured: () => api.get("/products/featured"),
  getRecommendations: (id) => api.get(`/products/${id}/recommendations`),
  getMyProducts: () => api.get("/products/farmer/my-products"),
  create: (formData) =>
    api.post("/products", formData, { headers: { "Content-Type": "multipart/form-data" } }),
  update: (id, formData) =>
    api.put(`/products/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } }),
  delete: (id) => api.delete(`/products/${id}`),
};
