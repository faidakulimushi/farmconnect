import api from "./api";

export const reviewService = {
  getByProduct: (productId) => api.get(`/reviews/${productId}`),
  create: (data) => api.post("/reviews", data),
  delete: (id) => api.delete(`/reviews/${id}`),
};
