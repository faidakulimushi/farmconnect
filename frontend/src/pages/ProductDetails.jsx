import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ShoppingCart, Heart, MapPin, Star, Package, ChevronRight, Loader2 } from "lucide-react";
import { productService } from "../services/productService";
import { reviewService } from "../services/reviewService";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";
import StarRating from "../components/StarRating";
import AIRecommendations from "../components/AIRecommendations";
import SocialShare from "../components/SocialShare";
import { formatCurrency, formatDate, truncate } from "../utils/helpers";
import { PLACEHOLDER_IMAGE } from "../utils/constants";
import toast from "react-hot-toast";

export default function ProductDetails() {
  const { id } = useParams();
  const { addToCart, isAdding } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated, user } = useAuth();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);

  // Review form
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const load = async () => {
      setLoading(true);
      try {
        const [prodRes, revRes] = await Promise.all([
          productService.getById(id),
          reviewService.getByProduct(id),
        ]);
        setProduct(prodRes.data.product);
        setReviews(revRes.data.reviews || []);
      } catch {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const adding = product ? isAdding(product._id) : false;

  // ── Dynamic Open Graph + Twitter Card meta tags ──────────────────────────
  // NOTE: Because this is a client-side SPA, crawlers that don't execute JS
  // (e.g. some Facebook bots) will see the default tags from index.html.
  // For full crawler support, add a prerender/SSR layer.
  useEffect(() => {
    if (!product) return;

    const pageUrl  = window.location.href;
    const imgUrl   = product.image || `${window.location.origin}/og-default.png`;
    const desc     = product.description
      ? product.description.slice(0, 160)
      : `Fresh ${product.title} available on AgriLink Market.`;
    const fullTitle = `${product.title} — ${formatCurrency(product.price)} | AgriLink Market`;

    const setMeta = (property, content, isName = false) => {
      const attr  = isName ? "name" : "property";
      let el = document.querySelector(`meta[${attr}="${property}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, property);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    // Page title
    document.title = fullTitle;

    // Open Graph (Facebook)
    setMeta("og:type",        "product");
    setMeta("og:title",       fullTitle);
    setMeta("og:description", desc);
    setMeta("og:image",       imgUrl);
    setMeta("og:url",         pageUrl);
    setMeta("og:site_name",   "AgriLink Market");

    // Twitter / X Card
    setMeta("twitter:card",        "summary_large_image", true);
    setMeta("twitter:title",       fullTitle,             true);
    setMeta("twitter:description", desc,                  true);
    setMeta("twitter:image",       imgUrl,                true);

    return () => {
      // Reset to site defaults on unmount
      document.title = "AgriLink Market – Farm Fresh Delivered";
      setMeta("og:type",  "website");
      setMeta("og:title", "AgriLink Market – Farm Fresh Delivered");
      setMeta("og:description", "Connect with local farmers and get the freshest groceries delivered.");
      setMeta("og:image", `${window.location.origin}/og-default.png`);
      setMeta("og:url",   window.location.origin);
      setMeta("twitter:card",        "summary_large_image", true);
      setMeta("twitter:title",       "AgriLink Market",     true);
      setMeta("twitter:description", "Fresh produce directly from local farmers.", true);
    };
  }, [product]);

  const handleAddToCart = () => {
    if (!isAuthenticated) { toast.error("Please log in to add items to your cart."); return; }
    addToCart(product._id, qty);
  };

  const inWishlist = product ? isInWishlist(product._id) : false;

  const handleWishlist = () => {
    if (!isAuthenticated) { toast.error("Please login to use wishlist"); return; }
    inWishlist ? removeFromWishlist(product._id) : addToWishlist(product._id);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewRating) { toast.error("Please select a rating"); return; }
    setSubmittingReview(true);
    try {
      await reviewService.create({ productId: id, rating: reviewRating, comment: reviewComment });
      toast.success("Review submitted!");
      setReviewRating(0);
      setReviewComment("");
      const { data } = await reviewService.getByProduct(id);
      setReviews(data.reviews || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage />;
  if (!product) return (
    <div className="container-custom py-20 text-center">
      <p className="text-5xl mb-4">🌾</p>
      <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300">Product not found</h2>
      <Link to="/products" className="btn-primary mt-4 inline-flex">Back to Products</Link>
    </div>
  );

  return (
    <div className="container-custom py-8 animate-fade-in">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
        <Link to="/" className="hover:text-primary-600">Home</Link>
        <ChevronRight className="w-4 h-4" />
        <Link to="/products" className="hover:text-primary-600">Products</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-700 dark:text-gray-300 truncate max-w-[200px]">{product.title}</span>
      </nav>

      {/* Main info */}
      <div className="grid md:grid-cols-2 gap-10 mb-12">
        {/* Image */}
        <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800">
          <img src={product.image || PLACEHOLDER_IMAGE} alt={product.title} className="w-full h-full object-cover" onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }} />
        </div>

        {/* Info */}
        <div>
          <span className="badge bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 mb-3">
            {product.category?.name}
          </span>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{product.title}</h1>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <StarRating rating={product.rating} size="md" />
            <span className="text-sm text-gray-600 dark:text-gray-400">({product.numReviews} reviews)</span>
          </div>

          <p className="text-3xl font-extrabold text-primary-700 dark:text-primary-400 mb-1">
            {formatCurrency(product.price)}
          </p>
          <p className="text-sm text-gray-500 mb-5">per {product.unit || "kg"}</p>

          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">{product.description}</p>

          {/* Social share */}
          <div className="mb-5">
            <SocialShare
              title={product.title}
              description={`${formatCurrency(product.price)} per ${product.unit || "kg"} — ${product.description}`}
              url={window.location.href}
            />
          </div>

          {/* Stock */}
          <div className="flex items-center gap-2 mb-5">
            <Package className="w-4 h-4 text-gray-400" />
            <span className={`text-sm font-medium ${product.quantity > 0 ? "text-green-600 dark:text-green-400" : "text-red-500"}`}>
              {product.quantity > 0 ? `${product.quantity} ${product.unit || "kg"} in stock` : "Out of stock"}
            </span>
          </div>

          {/* Farmer */}
          <div className="flex items-start gap-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 mb-6">
            <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-700 font-bold shrink-0">
              {product.farmer?.name?.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{product.farmer?.farmName || product.farmer?.name}</p>
              {product.farmer?.farmLocation && (
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3" /> {product.farmer.farmLocation}
                </p>
              )}
            </div>
          </div>

          {/* Qty + Actions */}
          {product.quantity > 0 && (
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-l-lg">−</button>
                <span className="px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white border-x border-gray-300 dark:border-gray-600">{qty}</span>
                <button onClick={() => setQty(Math.min(product.quantity, qty + 1))} className="px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-r-lg">+</button>
              </div>
              <button onClick={handleAddToCart} disabled={adding} className="btn-primary flex-1 gap-2 disabled:opacity-70">
                {adding
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Adding…</>
                  : <><ShoppingCart className="w-4 h-4" /> Add to Cart</>}
              </button>
              <button onClick={handleWishlist} className={`p-2.5 rounded-lg border transition-colors ${inWishlist ? "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-500" : "border-gray-300 dark:border-gray-600 text-gray-500 hover:border-red-400"}`}>
                <Heart className={`w-5 h-5 ${inWishlist ? "fill-red-500" : ""}`} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Reviews section */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-10 mb-10">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Customer Reviews ({reviews.length})
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          {/* Review list */}
          <div className="space-y-4">
            {reviews.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-sm">No reviews yet. Be the first!</p>
            )}
            {(reviews || []).map((r) => (
              <div key={r._id} className="card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-xs font-bold text-primary-700">
                    {r.customer?.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{r.customer?.name}</p>
                    <p className="text-xs text-gray-400">{formatDate(r.createdAt)}</p>
                  </div>
                </div>
                <StarRating rating={r.rating} size="sm" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{r.comment}</p>
              </div>
            ))}
          </div>

          {/* Review form */}
          {isAuthenticated && user?.role === "customer" && (
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Leave a Review</h3>
              <form onSubmit={handleReviewSubmit} className="card p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your Rating</label>
                  <StarRating rating={reviewRating} interactive onRate={setReviewRating} size="lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Comment</label>
                  <textarea value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} rows={4} placeholder="Share your experience…" className="input resize-none" required />
                </div>
                <button type="submit" disabled={submittingReview || !reviewRating} className="btn-primary w-full">
                  {submittingReview ? "Submitting…" : "Submit Review"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Recommendations */}
      <AIRecommendations productId={id} title="Related Products" />
    </div>
  );
}
