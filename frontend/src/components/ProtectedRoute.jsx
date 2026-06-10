import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "./LoadingSpinner";

/**
 * Wraps protected routes.
 * - Redirects unauthenticated users to /login.
 * - Optionally restricts access to specific roles via `allowedRoles`.
 */
export default function ProtectedRoute({ allowedRoles = [] }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return <LoadingSpinner fullPage />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // Redirect to the appropriate dashboard
    const dashboards = { farmer: "/dashboard/farmer", admin: "/dashboard/admin", customer: "/" };
    return <Navigate to={dashboards[user?.role] || "/"} replace />;
  }

  return <Outlet />;
}
