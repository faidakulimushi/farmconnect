import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "./LoadingSpinner";
import { ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * Wraps protected routes.
 * - Redirects unauthenticated users to /login (preserving intended path).
 * - Shows "Access Denied" for authenticated users with the wrong role.
 */
export default function ProtectedRoute({ allowedRoles = [] }) {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingSpinner fullPage />;

  // Not logged in → redirect to login, preserving intended URL
  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // Logged in but wrong role → show Access Denied
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 bg-gray-50 dark:bg-gray-950">
        <div className="text-center max-w-md animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-5">
            <ShieldAlert className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            You don't have permission to access this page.
            {allowedRoles.includes("admin") && " Only administrators can view this section."}
          </p>
          <div className="flex gap-3 justify-center">
            <Link to="/" className="btn-secondary">Go Home</Link>
            <Link
              to={
                user?.role === "farmer" ? "/dashboard/farmer"
                : user?.role === "admin" ? "/dashboard/admin"
                : "/"
              }
              className="btn-primary"
            >
              My Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
