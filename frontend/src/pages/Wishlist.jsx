import { Heart, ShoppingBag, Trash2, Tag, User } from "lucide-react";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { formatCurrency } from "../utils/helpers";
import { PLACEHOLDER_IMAGE } from "../utils/constants";
import toast from "react-hot-toast";

function WishlistCard({ product }) {
  const { removeFromWishlist } = useWishlist();
  const { addToCart, isAdding } = useCart();
  const { isAuthenticated } = useAuth();

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error("Please log in to add items to your cart.");
      return;
    }
    addToCart(product._id, 1);
  };

  return (
    <div className="card overflow-hidden flex flex-col sm:flex-row gap-0 hover:shadow-md transition-shadow duration-300">
      {/* Product image */}
      <Link to={`/products/${product._id}`} className="shrink-0">
        <div className="w-full sm:w-36 h-44 sm:h-full overflow-hidden bg-gray-100 dark:bg-gray-700">
          <img
            src={product.image || PLACEHOLDER_IMAGE}
            alt={product.title}
            loading="lazy"
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
          />
        </div>
      </Link>

      {/* Details */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        {/* Category */}
        <div className="flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 font-medium">
          <Tag className="w-3 h-3" />
          <span>{product.category?.name || "General"}</span>
        </div>

        {/* Title */}
        <Link
          to={`/products/${product._id}`}
          className="font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors leading-snug line-clamp-2"
        >
          {product.title}
        </Link>

        {/* Seller */}
        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
          <User className="w-3 h-3" />
          <span>by {product.farmer?.farmName || product.farmer?.name || "Unknown Seller"}</span>
        </div>

        {/* Price */}
        <div className="mt-auto pt-2 flex items-center justify-between flex-wrap gap-2">
          <div>
            <p className="font-bold text-lg text-primary-700 dark:text-primary-400">
              {formatCurrency(product.price)}
            </p>
            <p className="text-xs text-gray-400">per {product.unit || "kg"}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleAddToCart}
              disabled={product.quantity === 0 || isAdding(product._id)}
              className="btn-primary btn-sm gap-1.5 text-xs"
              aria-label="Add to cart"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              {product.quantity === 0 ? "Out of Stock" : "Add to Cart"}
            </button>
            <button
              onClick={() => removeFromWishlist(product._id)}
              className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              aria-label="Remove from wishlist"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Wishlist() {
  const { wishlist, wishlistCount } = useWishlist();

  return (
    <div className="container-custom py-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Heart className="w-6 h-6 text-red-500 fill-red-500" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Wishlist</h1>
        {wishlistCount > 0 && (
          <span className="px-2.5 py-0.5 rounded-full text-sm font-semibold bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300">
            {wishlistCount} {wishlistCount === 1 ? "item" : "items"}
          </span>
        )}
      </div>

      {wishlistCount === 0 ? (
        /* Empty state */
        <div className="text-center py-24">
          <div className="w-20 h-20 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-5">
            <Heart className="w-10 h-10 text-red-300 dark:text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Your wishlist is empty
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">
            Save products you love and find them here later.
          </p>
          <Link to="/products" className="btn-primary gap-2">
            <ShoppingBag className="w-4 h-4" />
            Browse Products
          </Link>
        </div>
      ) : (
        /* Product grid */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {wishlist.map((product) => (
            <WishlistCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
