// @refresh reset
import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

const STORAGE_KEY = "farmconnect_wishlist";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  });

  // Persist to localStorage whenever wishlist changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlist));
    } catch { /* storage full or unavailable */ }
  }, [wishlist]);

  const addToWishlist = (product) => {
    setWishlist((prev) => {
      if (prev.some((p) => p._id === product._id)) return prev;
      toast.success("Added to wishlist");
      return [...prev, product];
    });
  };

  const removeFromWishlist = (productId) => {
    setWishlist((prev) => {
      toast.success("Removed from wishlist");
      return prev.filter((p) => p._id !== productId);
    });
  };

  const toggleWishlist = (product) => {
    if (wishlist.some((p) => p._id === product._id)) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product);
    }
  };

  const isInWishlist = (productId) => wishlist.some((p) => p._id === productId);

  const wishlistCount = wishlist.length;

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, toggleWishlist, isInWishlist, wishlistCount }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
};
