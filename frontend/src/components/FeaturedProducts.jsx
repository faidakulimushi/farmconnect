import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Star } from "lucide-react";
import { productService } from "../services/productService";
import ProductCard from "./ProductCard";
import LoadingSpinner from "./LoadingSpinner";

export default function FeaturedProducts() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productService.getFeatured()
      .then(({ data }) => setFeatured(data.featured || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading featured products…" />;
  if (!featured.length) return null;

  return (
    <section className="py-14 bg-gray-50 dark:bg-gray-900/50">
      <div className="container-custom">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Star className="w-5 h-5 text-accent-500 fill-accent-500" />
              <span className="text-sm font-medium text-primary-600 dark:text-primary-400 uppercase tracking-wide">Featured</span>
            </div>
            <h2 className="section-heading">Hand-Picked Products</h2>
          </div>
          <Link to="/products?featured=true" className="hidden sm:flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400 hover:underline font-medium">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
          {featured.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
