import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard, Package, ShoppingBag, Users, Tag, LogOut,
  ChevronRight, Sprout, Settings,
} from "lucide-react";

const farmerLinks = [
  { to: "/dashboard/farmer", label: "Dashboard", icon: LayoutDashboard },
  { to: "/dashboard/farmer/products", label: "My Products", icon: Package },
  { to: "/dashboard/farmer/orders", label: "Orders", icon: ShoppingBag },
  { to: "/dashboard/farmer/profile", label: "Profile", icon: Settings },
];

const adminLinks = [
  { to: "/dashboard/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/dashboard/admin/users", label: "Manage Users", icon: Users },
  { to: "/dashboard/admin/products", label: "Products", icon: Package },
  { to: "/dashboard/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/dashboard/admin/categories", label: "Categories", icon: Tag },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const links = user?.role === "admin" ? adminLinks : farmerLinks;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Brand */}
        <div className="px-6 py-5 flex items-center gap-2 border-b border-gray-200 dark:border-gray-700">
          <Sprout className="w-7 h-7 text-primary-600" />
          <span className="font-bold text-lg text-gray-900 dark:text-white">AgriLink</span>
        </div>

        {/* User info */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold text-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-[130px]">{user?.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to.split("/").length === 3}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
              <ChevronRight className="w-3 h-3 ml-auto opacity-50" />
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 pb-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}
