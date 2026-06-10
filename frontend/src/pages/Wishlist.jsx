import { Heart } from "lucide-react";
import { useWishlist } from "../context/WishlistContext";
import ProductCard from "../components/ProductCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { Link } from "react-router-dom";

export default function Wishlist() {
  const { wishlist } = useWishlist();

  if (!wishlist) return <LoadingSpinner />;

  return (
    <div className="container-custom py-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <Heart className="w-6 h-6 text-red-500 fill-red-500" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Wishlist</h1>
        <span className="badge bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">{wishlist.length}</span>
      </div>

      {wishlist.length === 0 ? (
        <div className="text-center py-20">
          <Heart className="w-16 h-16 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
          <p className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">Your wishlist is empty</p>
          <p className="text-gray-500 mb-6">Save products you love and find them here later.</p>
          <Link to="/products" className="btn-primary">Browse Products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {(wishlist || []).filter(p => p.isActive).map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
