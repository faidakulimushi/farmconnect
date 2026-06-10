import { useState, useEffect } from "react";
import { userService } from "../../services/userService";
import { formatCurrency, formatDate, statusColor, capitalise } from "../../utils/helpers";
import { Users, Package, ShoppingBag, DollarSign } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import LoadingSpinner from "../../components/LoadingSpinner";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userService.getStats()
      .then(({ data }) => setStats(data.stats))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading admin dashboard…" />;
  if (!stats) return <p className="text-red-500">Failed to load stats.</p>;

  const chartData = stats.monthlyRevenue?.map((d) => ({
    name: MONTHS[d._id.month - 1],
    revenue: d.revenue,
    orders: d.count,
  })) || [];

  const statCards = [
    { icon: Users, label: "Total Customers", value: stats.totalUsers, color: "text-blue-600 bg-blue-50 dark:bg-blue-900/30" },
    { icon: Users, label: "Total Farmers", value: stats.totalFarmers, color: "text-purple-600 bg-purple-50 dark:bg-purple-900/30" },
    { icon: Package, label: "Active Products", value: stats.totalProducts, color: "text-orange-600 bg-orange-50 dark:bg-orange-900/30" },
    { icon: ShoppingBag, label: "Total Orders", value: stats.totalOrders, color: "text-red-600 bg-red-50 dark:bg-red-900/30" },
    { icon: DollarSign, label: "Total Revenue", value: formatCurrency(stats.totalRevenue), color: "text-green-600 bg-green-50 dark:bg-green-900/30" },
  ];

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Admin Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {statCards.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="card p-4">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${color}`}>
              <Icon className="w-4 h-4" />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Chart */}
        <div className="card p-5">
          <h2 className="font-bold text-gray-900 dark:text-white mb-4">Monthly Revenue</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Bar dataKey="revenue" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-500 py-10 text-center">No revenue data yet</p>
          )}
        </div>

        {/* Orders by status */}
        <div className="card p-5">
          <h2 className="font-bold text-gray-900 dark:text-white mb-4">Orders by Status</h2>
          <div className="space-y-3">
            {stats.ordersByStatus?.map(({ _id, count }) => (
              <div key={_id} className="flex items-center gap-3">
                <span className={`badge ${statusColor(_id)} min-w-[90px] justify-center`}>{capitalise(_id)}</span>
                <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-primary-500 h-2 rounded-full"
                    style={{ width: `${Math.min(100, (count / stats.totalOrders) * 100)}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 w-8 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div className="card p-5">
        <h2 className="font-bold text-gray-900 dark:text-white mb-4">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-gray-100 dark:border-gray-700">
                <th className="pb-3 font-medium">Order ID</th>
                <th className="pb-3 font-medium">Customer</th>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Total</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {stats.recentOrders?.map((order) => (
                <tr key={order._id}>
                  <td className="py-3 font-mono text-xs">#{order._id.slice(-8).toUpperCase()}</td>
                  <td className="py-3 text-gray-700 dark:text-gray-300">{order.customer?.name}</td>
                  <td className="py-3 text-gray-500">{formatDate(order.createdAt)}</td>
                  <td className="py-3 font-semibold text-primary-600 dark:text-primary-400">{formatCurrency(order.totalPrice)}</td>
                  <td className="py-3"><span className={`badge ${statusColor(order.status)}`}>{capitalise(order.status)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
