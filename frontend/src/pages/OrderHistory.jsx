import { useState, useEffect } from "react";
import { orderService } from "../services/orderService";
import { formatCurrency, formatDate, statusColor, capitalise } from "../utils/helpers";
import { Package, ChevronDown, ChevronUp } from "lucide-react";
import { PLACEHOLDER_IMAGE } from "../utils/constants";
import LoadingSpinner from "../components/LoadingSpinner";

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    orderService.getMyOrders()
      .then(({ data }) => setOrders(data.orders))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading orders…" />;

  return (
    <div className="container-custom py-8 animate-fade-in max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Package className="w-6 h-6 text-primary-600" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Order History</h1>
        <span className="badge bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">{orders.length}</span>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <Package className="w-16 h-16 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
          <p className="text-lg font-semibold text-gray-600 dark:text-gray-400">No orders yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="card overflow-hidden">
              <button
                onClick={() => setExpandedId(expandedId === order._id ? null : order._id)}
                className="w-full flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center gap-4 text-left">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      Order #{order._id.slice(-8).toUpperCase()}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{formatDate(order.createdAt)}</p>
                  </div>
                  <span className={`badge ${statusColor(order.status)}`}>{capitalise(order.status)}</span>
                  <span className={`badge ${statusColor(order.paymentStatus)}`}>{capitalise(order.paymentStatus)}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-primary-600 dark:text-primary-400">{formatCurrency(order.totalPrice)}</span>
                  {expandedId === order._id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
              </button>

              {expandedId === order._id && (
                <div className="border-t border-gray-100 dark:border-gray-700 p-5 space-y-4 animate-fade-in">
                  {/* Items */}
                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div key={item._id} className="flex gap-3">
                        <img src={item.image || PLACEHOLDER_IMAGE} alt={item.title} className="w-12 h-12 rounded-lg object-cover bg-gray-100" onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }} />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{item.title}</p>
                          <p className="text-xs text-gray-500">× {item.quantity} @ {formatCurrency(item.price)}</p>
                        </div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>

                  {/* Shipping */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-sm">
                    <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Shipping Address</p>
                    <p className="text-gray-500">{order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}, {order.shippingAddress.country}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
