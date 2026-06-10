import { Link } from "react-router-dom";
import { Home, Sprout } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 animate-fade-in">
      <p className="text-8xl mb-4">🌾</p>
      <h1 className="text-6xl font-extrabold text-gray-900 dark:text-white mb-2">404</h1>
      <p className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">Page not found</p>
      <p className="text-gray-500 dark:text-gray-500 mb-8 max-w-sm">
        Looks like this field is empty. The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex gap-3">
        <Link to="/" className="btn-primary gap-2">
          <Home className="w-4 h-4" /> Go Home
        </Link>
        <Link to="/products" className="btn-secondary gap-2">
          <Sprout className="w-4 h-4" /> Browse Products
        </Link>
      </div>
    </div>
  );
}
