import { useState, useEffect } from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import { productService } from "../services/productService";
import ProductCard from "./ProductCard";
import LoadingSpinner from "./LoadingSpinner";
import { Link } from "react-router-dom";

/**
 * AI Recommendation section – shows content-based recommendations
 * for a given product, or best-sellers when no productId is provided.
 */
export default function AIRecommendations({ productId, title = "You Might Also Like" }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        let products;
        if (productId) {
          const { data } = await productService.getRecommendations(productId);
          products = data.recommendations;
        } else {
          const { data } = await productService.getFeatured();
          products = data.bestSellers;
        }
        setRecommendations(products || []);
      } catch {
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [productId]);

  if (loading) return <LoadingSpinner text="Loading recommendations…" />;
  if (!recommendations.length) return null;

  return (
    <section className="py-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent-500" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
        </div>
        <Link to="/products" className="flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400 hover:underline font-medium">
          View All <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {recommendations.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </section>
  );
}
