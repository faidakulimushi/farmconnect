// @refresh reset
import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState([]);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) fetchWishlist();
    else setWishlist([]);
  }, [isAuthenticated]);

  const fetchWishlist = async () => {
    try {
      const { data } = await api.get("/wishlist");
      setWishlist(data.products || []);
    } catch { /* silent */ }
  };

  const addToWishlist = async (productId) => {
    try {
      await api.post("/wishlist", { productId });
      await fetchWishlist();
      toast.success("Added to wishlist");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add to wishlist");
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      await api.delete(`/wishlist/${productId}`);
      setWishlist((prev) => prev.filter((p) => p._id !== productId));
      toast.success("Removed from wishlist");
    } catch {
      toast.error("Could not remove from wishlist");
    }
  };

  const isInWishlist = (productId) => wishlist.some((p) => p._id === productId);

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist, fetchWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
};
