import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { userService } from "../../services/userService";
import { Package, ShoppingBag, DollarSign, TrendingUp, ArrowRight } from "lucide-react";
import { formatCurrency, formatDate, statusColor, capitalise } from "../../utils/helpers";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function FarmerDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userService.getFarmerStats()
      .then(({ data }) => setStats(data.stats))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading dashboard…" />;
  if (!stats) return <p className="text-gray-500">Could not load stats.</p>;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Farmer Dashboard</h1>
        <Link to="/dashboard/farmer/products/add" className="btn-primary btn-sm">+ Add Product</Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-5 mb-8">
        {[
          { icon: Package, label: "Products Listed", value: stats.totalProducts, color: "text-blue-600 bg-blue-50 dark:bg-blue-900/30" },
          { icon: ShoppingBag, label: "Total Orders", value: stats.totalOrders, color: "text-purple-600 bg-purple-50 dark:bg-purple-900/30" },
          { icon: DollarSign, label: "Total Revenue", value: formatCurrency(stats.totalRevenue), color: "text-green-600 bg-green-50 dark:bg-green-900/30" },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="card p-5">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <Link to="/dashboard/farmer/products" className="card p-5 flex items-center justify-between hover:border-primary-300 hover:shadow-md transition-all group">
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">Manage Products</p>
            <p className="text-sm text-gray-500 mt-0.5">View, edit, or delete your listings</p>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
        </Link>
        <Link to="/dashboard/farmer/orders" className="card p-5 flex items-center justify-between hover:border-primary-300 hover:shadow-md transition-all group">
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">View Orders</p>
            <p className="text-sm text-gray-500 mt-0.5">Update and track customer orders</p>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
        </Link>
      </div>

      {/* Recent orders table */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900 dark:text-white">Recent Orders</h2>
          <Link to="/dashboard/farmer/orders" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {stats.recentOrders?.length === 0 ? (
          <p className="text-sm text-gray-500">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                  <th className="pb-3 font-medium">Order ID</th>
                  <th className="pb-3 font-medium">Customer</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {stats.recentOrders?.map((order) => (
                  <tr key={order._id}>
                    <td className="py-3 font-mono text-xs">#{order._id.slice(-8).toUpperCase()}</td>
                    <td className="py-3 text-gray-700 dark:text-gray-300">{order.customer?.name}</td>
                    <td className="py-3 text-gray-500">{formatDate(order.createdAt)}</td>
                    <td className="py-3"><span className={`badge ${statusColor(order.status)}`}>{capitalise(order.status)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
