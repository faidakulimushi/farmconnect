import Hero from "../components/Hero";
import FeaturedProducts from "../components/FeaturedProducts";
import AIRecommendations from "../components/AIRecommendations";
import CategoryFilter from "../components/CategoryFilter";
import { Link } from "react-router-dom";
import { Truck, RefreshCw, ShieldCheck, Headphones } from "lucide-react";

const features = [
  { icon: Truck, title: "Free Delivery", desc: "On orders over $50" },
  { icon: RefreshCw, title: "Easy Returns", desc: "Hassle-free returns within 24h" },
  { icon: ShieldCheck, title: "Secure Payments", desc: "100% protected transactions" },
  { icon: Headphones, title: "24/7 Support", desc: "Always here to help" },
];

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <Hero />

      {/* Trust badges */}
      <section className="border-b border-gray-100 dark:border-gray-800">
        <div className="container-custom py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="container-custom py-10">
        <div className="mb-6">
          <h2 className="section-heading mb-1">Shop by Category</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Browse fresh produce by category</p>
        </div>
        <CategoryFilter />
      </section>

      {/* Featured Products */}
      <FeaturedProducts />

      {/* AI Recommendations (best sellers) */}
      <section className="container-custom py-4 pb-14">
        <AIRecommendations title="Best Sellers This Week" />
      </section>

      {/* CTA Banner */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-900 dark:to-gray-900">
        <div className="container-custom py-14 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Are You a Farmer?</h2>
          <p className="text-primary-100 max-w-xl mx-auto mb-6">
            Join AgriLink and reach thousands of customers. List your products, manage your
            inventory, and grow your business online for free.
          </p>
          <Link to="/register?role=farmer" className="btn bg-white text-primary-700 hover:bg-gray-100 px-7 py-3 font-semibold rounded-lg text-base shadow-lg">
            Start Selling Today
          </Link>
        </div>
      </section>
    </div>
  );
}
