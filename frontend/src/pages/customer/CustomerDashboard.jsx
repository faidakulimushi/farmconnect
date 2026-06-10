import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { orderService } from "../../services/orderService";
import { Package, Heart, ShoppingBag, ArrowRight } from "lucide-react";
import { formatCurrency, formatDate, statusColor, capitalise } from "../../utils/helpers";
import { useWishlist } from "../../context/WishlistContext";
import { useAuth } from "../../context/AuthContext";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function CustomerDashboard() {
  const { user } = useAuth();
  const { wishlist } = useWishlist();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService.getMyOrders()
      .then(({ data }) => setOrders((data.orders || []).slice(0, 5)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Welcome back, {user?.name}! 👋
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">Here's what's happening with your account.</p>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        {[
          { icon: Package, label: "Total Orders", value: orders.length, color: "text-blue-600 bg-blue-50 dark:bg-blue-900/30" },
          { icon: Heart, label: "Wishlist Items", value: wishlist.length, color: "text-red-500 bg-red-50 dark:bg-red-900/30" },
          { icon: ShoppingBag, label: "Delivered", value: orders.filter(o => o.status === "delivered").length, color: "text-green-600 bg-green-50 dark:bg-green-900/30" },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="card p-5">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900 dark:text-white">Recent Orders</h2>
          <Link to="/orders" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {loading ? <LoadingSpinner /> : orders.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm">No orders yet. <Link to="/products" className="text-primary-600 hover:underline">Start shopping!</Link></p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                  <th className="pb-3 font-medium">Order ID</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Total</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td className="py-3 font-mono text-xs text-gray-700 dark:text-gray-300">#{order._id.slice(-8).toUpperCase()}</td>
                    <td className="py-3 text-gray-500 dark:text-gray-400">{formatDate(order.createdAt)}</td>
                    <td className="py-3 font-semibold text-gray-900 dark:text-white">{formatCurrency(order.totalPrice)}</td>
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
