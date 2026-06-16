import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Heart, Star, Loader2, Pencil, Trash2 } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import { productService } from "../services/productService";
import { formatCurrency, truncate } from "../utils/helpers";
import { PLACEHOLDER_IMAGE } from "../utils/constants";
import toast from "react-hot-toast";

export default function ProductCard({ product, onDeleted }) {
  const navigate = useNavigate();
  const { addToCart, isAdding } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated, user } = useAuth();

  const isOwner =
    isAuthenticated &&
    user &&
    (user.role === "admin" ||
      (product.farmer && user._id === (product.farmer._id ?? product.farmer).toString()));

  const inWishlist = isInWishlist(product._id);
  const adding = isAdding(product._id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Please log in to add items to your cart.");
      return;
    }
    addToCart(product._id, 1);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    inWishlist ? removeFromWishlist(product._id) : addToWishlist(product);
  };

  const handleEdit = (e) => {
    e.preventDefault();
    navigate(`/dashboard/farmer/products/edit/${product._id}`);
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    if (!window.confirm(`Delete "${product.title}"? This cannot be undone.`)) return;
    try {
      await productService.delete(product._id);
      toast.success("Product deleted.");
      if (onDeleted) onDeleted(product._id);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete product");
    }
  };

  return (
    <Link to={`/products/${product._id}`} className="group block card overflow-hidden hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700">
        <img
          src={product.image || PLACEHOLDER_IMAGE}
          alt={product.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
        />
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isFeatured && (
            <span className="badge bg-accent-500 text-white text-xs">Featured</span>
          )}
          {product.quantity === 0 && (
            <span className="badge bg-red-500 text-white text-xs">Out of Stock</span>
          )}
        </div>
        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          className={`absolute top-2 right-2 w-8 h-8 rounded-full bg-white dark:bg-gray-800 shadow flex items-center justify-center transition-all hover:scale-110 ${inWishlist ? "opacity-100" : "opacity-60 group-hover:opacity-100"}`}
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={`w-4 h-4 transition-colors ${inWishlist ? "fill-red-500 text-red-500" : "text-gray-400 hover:text-red-400"}`} />
        </button>
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-xs text-primary-600 dark:text-primary-400 font-medium mb-1">
          {product.category?.name || "General"}
        </p>
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1 leading-snug">
          {truncate(product.title, 50)}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          by {product.farmer?.farmName || product.farmer?.name}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          <Star className="w-3.5 h-3.5 text-accent-400 fill-accent-400" />
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
            {product.rating?.toFixed(1) || "0.0"}
          </span>
          <span className="text-xs text-gray-400">({product.numReviews})</span>
        </div>

        {/* Price + Cart */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-primary-700 dark:text-primary-400">
              {formatCurrency(product.price)}
            </p>
            <p className="text-xs text-gray-400">per {product.unit || "kg"}</p>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={product.quantity === 0 || adding}
            className="btn-primary btn-sm gap-1.5 text-xs"
            aria-label="Add to cart"
          >
            {adding
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <ShoppingCart className="w-3.5 h-3.5" />}
            {adding ? "Adding…" : "Add"}
          </button>
        </div>

        {/* Owner actions */}
        {isOwner && (
          <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <button
              onClick={handleEdit}
              className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-1.5 rounded-lg bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" /> Edit
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-1.5 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        )}
      </div>
    </Link>
  );
}
