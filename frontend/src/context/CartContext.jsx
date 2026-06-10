// @refresh reset
import { createContext, useContext, useEffect, useReducer, useState, useCallback } from "react";
import api from "../services/api";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

const CartContext = createContext(null);

const initialState = { items: [], total: 0, loading: false };

function cartReducer(state, action) {
  switch (action.type) {
    case "SET_CART":
      return { ...state, items: action.payload.items || [], total: action.payload.total || 0, loading: false };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "CLEAR":
      return { ...initialState };
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { isAuthenticated } = useAuth();
  // Track which productIds have a pending add request to prevent duplicates
  const [addingIds, setAddingIds] = useState(new Set());

  // Fetch cart when user logs in
  useEffect(() => {
    if (isAuthenticated) fetchCart();
    else dispatch({ type: "CLEAR" });
  }, [isAuthenticated]);

  const fetchCart = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const { data } = await api.get("/cart");
      dispatch({ type: "SET_CART", payload: data });
    } catch {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const addToCart = useCallback(async (productId, quantity = 1) => {
    // Prevent duplicate in-flight requests for the same product
    if (addingIds.has(productId)) return;

    setAddingIds((prev) => new Set(prev).add(productId));
    try {
      const { data } = await api.post("/cart", { productId, quantity });
      dispatch({ type: "SET_CART", payload: data });
      toast.success("Product added to cart successfully.");
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error("Your session has expired. Please log in again.");
      } else {
        toast.error(err.response?.data?.message || "Could not add to cart.");
      }
    } finally {
      setAddingIds((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  }, [addingIds]);

  const isAdding = useCallback((productId) => addingIds.has(productId), [addingIds]);

  const updateQuantity = async (productId, quantity) => {
    try {
      const { data } = await api.put(`/cart/${productId}`, { quantity });
      dispatch({ type: "SET_CART", payload: data });
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  const removeItem = async (productId) => {
    try {
      const { data } = await api.delete(`/cart/${productId}`);
      dispatch({ type: "SET_CART", payload: data });
      toast.success("Item removed");
    } catch {
      toast.error("Could not remove item");
    }
  };

  const clearCart = async () => {
    try {
      await api.delete("/cart/clear");
      dispatch({ type: "CLEAR" });
    } catch {
      /* ignore */
    }
  };

  const cartCount = state.items.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ ...state, fetchCart, addToCart, updateQuantity, removeItem, clearCart, cartCount, isAdding }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
