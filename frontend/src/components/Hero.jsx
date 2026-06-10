import { Link } from "react-router-dom";
import { ArrowRight, Leaf, TrendingUp, ShieldCheck } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 dark:from-primary-900 dark:via-gray-900 dark:to-gray-950">
      {/* Decorative blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary-500/20 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full bg-accent-500/20 blur-3xl" />
      </div>

      <div className="container-custom relative py-20 md:py-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <div className="text-white animate-slide-up">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <Leaf className="w-4 h-4 text-primary-300" />
              100% Fresh & Organic
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              Farm Fresh Produce,{" "}
              <span className="text-accent-400">Direct to You</span>
            </h1>
            <p className="text-lg text-primary-100 max-w-lg mb-8 leading-relaxed">
              Connect with local farmers, discover seasonal produce, and get the
              freshest groceries delivered to your door — cutting out the middleman.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { label: "Farmers", value: "500+" },
                { label: "Products", value: "2K+" },
                { label: "Happy Customers", value: "10K+" },
              ].map(({ label, value }) => (
                <div key={label} className="text-center">
                  <p className="text-2xl font-bold text-white">{value}</p>
                  <p className="text-xs text-primary-200">{label}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <Link to="/products" className="btn bg-white text-primary-700 hover:bg-gray-100 px-6 py-3 font-semibold rounded-lg shadow-lg shadow-primary-900/30">
                Shop Now <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/register?role=farmer" className="btn bg-transparent border-2 border-white/60 text-white hover:bg-white/10 px-6 py-3 font-semibold rounded-lg">
                Become a Seller
              </Link>
            </div>
          </div>

          {/* Feature cards */}
          <div className="hidden lg:grid grid-cols-1 gap-4">
            {[
              {
                icon: Leaf,
                title: "Always Fresh",
                desc: "Products harvested and listed same day for maximum freshness.",
              },
              {
                icon: ShieldCheck,
                title: "Verified Farmers",
                desc: "Every seller is verified to ensure quality and trustworthiness.",
              },
              {
                icon: TrendingUp,
                title: "Fair Prices",
                desc: "No middlemen — get the best prices direct from the source.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 flex items-start gap-4 border border-white/20">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{title}</h3>
                  <p className="text-sm text-primary-200 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
