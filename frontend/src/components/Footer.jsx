import { Link } from "react-router-dom";
import { Sprout, Facebook, Instagram, Mail, Phone } from "lucide-react";

// X (Twitter) logo — not available in older lucide-react builds
function XIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

const SOCIAL_LINKS = [
  {
    href: "https://www.facebook.com/AgriLinkMarket",
    label: "Facebook",
    Icon: Facebook,
  },
  {
    href: "https://twitter.com/AgriLinkMarket",
    label: "X (Twitter)",
    Icon: XIcon,
  },
  {
    href: "https://www.instagram.com/AgriLinkMarket",
    label: "Instagram",
    Icon: Instagram,
  },
];

export default function Footer() {
  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-300">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sprout className="w-6 h-6 text-primary-400" />
              <span className="font-bold text-lg text-white">AgriLink Market</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Connecting farmers directly with customers for fresh, quality produce
              delivered right to your doorstep.
            </p>
            <div className="flex gap-3 mt-4">
              {SOCIAL_LINKS.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Follow us on ${label}`}
                  className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-primary-600 transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              {[
                { to: "/", label: "Home" },
                { to: "/products", label: "Products" },
                { to: "/about", label: "About Us" },
                { to: "/contact", label: "Contact" },
                { to: "/register?role=farmer", label: "Sell on AgriLink" },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="hover:text-primary-400 transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold text-white mb-4">Categories</h3>
            <ul className="space-y-2 text-sm">
              {["Vegetables", "Fruits", "Grains", "Dairy", "Meat & Poultry", "Herbs & Spices"].map((c) => (
                <li key={c}>
                  <Link to={`/products?category=${c.toLowerCase()}`} className="hover:text-primary-400 transition-colors">{c}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-white mb-4">Contact Us</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary-400 shrink-0" />
                <a
                  href="mailto:faidakulimushi431@gmail.com"
                  className="hover:text-primary-400 transition-colors break-all"
                >
                  faidakulimushi431@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary-400" />
                <span>+254 733 689 669</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500">
          <p>© {new Date().getFullYear()} AgriLink Market. All rights reserved.</p>
          <div className="flex gap-4 mt-2 sm:mt-0">
            <span className="hover:text-gray-300 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-gray-300 cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
