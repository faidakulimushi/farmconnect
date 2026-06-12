import api from "./api";

export const orderService = {
  create: (payload) => api.post("/orders", payload),
  getMyOrders: () => api.get("/orders"),
  getAll: () => api.get("/orders/all"),
  getById: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, data) => api.put(`/orders/${id}`, data),
  payOrder: (id) => api.put(`/orders/${id}/pay`),
};
