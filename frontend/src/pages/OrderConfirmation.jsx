import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { orderService } from "../services/orderService";
import { formatCurrency, formatDate, statusColor, capitalise } from "../utils/helpers";
import { PLACEHOLDER_IMAGE } from "../utils/constants";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  CheckCircle,
  Package,
  MapPin,
  CreditCard,
  Truck,
  Smartphone,
  Clock,
  ChevronRight,
} from "lucide-react";

const PAYMENT_LABELS = {
  cash_on_delivery: "Cash on Delivery",
  card: "Credit / Debit Card",
  mobile_money: "Mobile Money",
};

const PAYMENT_ICONS = {
  cash_on_delivery: Truck,
  card: CreditCard,
  mobile_money: Smartphone,
};

const STEP_LABELS = ["pending", "confirmed", "processing", "shipped", "delivered"];

export default function OrderConfirmation() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    orderService
      .getById(id)
      .then(({ data }) => setOrder(data.order))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner fullPage />;

  if (!order)
    return (
      <div className="container-custom py-20 text-center">
        <p className="text-5xl mb-4">📦</p>
        <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-4">Order not found</h2>
        <Link to="/orders" className="btn-primary">Back to Orders</Link>
      </div>
    );

  const PayIcon = PAYMENT_ICONS[order.paymentMethod] || CreditCard;
  const currentStep = STEP_LABELS.indexOf(order.status);
  const isCancelled = order.status === "cancelled";

  return (
    <div className="container-custom py-10 animate-fade-in max-w-3xl">
      {/* Success banner */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
          <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {order.isPaid ? "Payment Successful!" : "Order Placed!"}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-1">
          Order{" "}
          <span className="font-semibold text-gray-800 dark:text-gray-200">
            #{order._id.slice(-8).toUpperCase()}
          </span>{" "}
          has been received.
        </p>
        <p className="text-sm text-gray-400">{formatDate(order.createdAt)}</p>
      </div>

      {/* Progress tracker */}
      {!isCancelled && (
        <div className="card p-6 mb-6">
          <h2 className="font-bold text-gray-900 dark:text-white mb-5">Order Progress</h2>
          <div className="flex items-center justify-between relative">
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700 z-0" />
            <div
              className="absolute top-4 left-0 h-0.5 bg-primary-500 z-0 transition-all duration-500"
              style={{ width: `${(currentStep / (STEP_LABELS.length - 1)) * 100}%` }}
            />
            {STEP_LABELS.map((step, i) => {
              const done = i <= currentStep;
              return (
                <div key={step} className="flex flex-col items-center z-10">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                      done
                        ? "bg-primary-500 border-primary-500 text-white"
                        : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400"
                    }`}
                  >
                    {done ? "✓" : i + 1}
                  </div>
                  <p className={`text-xs mt-2 font-medium text-center ${done ? "text-primary-600 dark:text-primary-400" : "text-gray-400"}`}>
                    {capitalise(step)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {isCancelled && (
        <div className="card p-4 mb-6 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
          <p className="text-red-600 dark:text-red-400 font-semibold text-center">This order has been cancelled.</p>
        </div>
      )}

      {/* Items */}
      <div className="card p-6 mb-6">
        <h2 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-primary-600" /> Order Items
        </h2>
        <div className="space-y-4">
          {(order.items || []).map((item) => (
            <div key={item._id} className="flex gap-4">
              <img
                src={item.image || PLACEHOLDER_IMAGE}
                alt={item.title}
                className="w-16 h-16 rounded-xl object-cover bg-gray-100 shrink-0"
                onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white">{item.title}</p>
                <p className="text-sm text-gray-500 mt-0.5">
                  {item.quantity} × {formatCurrency(item.price)}
                </p>
              </div>
              <p className="font-semibold text-gray-900 dark:text-white shrink-0">
                {formatCurrency(item.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="border-t border-gray-100 dark:border-gray-700 mt-5 pt-4 space-y-2">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Subtotal</span>
            <span>{formatCurrency(order.totalPrice)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Shipping</span>
            <span className="text-green-600 font-medium">Free</span>
          </div>
          <div className="flex justify-between font-bold text-gray-900 dark:text-white text-base pt-2 border-t border-gray-100 dark:border-gray-700">
            <span>Total Paid</span>
            <span className="text-primary-600 dark:text-primary-400">{formatCurrency(order.totalPrice)}</span>
          </div>
        </div>
      </div>

      {/* Shipping + Payment info */}
      <div className="grid sm:grid-cols-2 gap-6 mb-8">
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary-600" /> Shipping Address
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {order.shippingAddress.street},<br />
            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip},<br />
            {order.shippingAddress.country}
          </p>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <PayIcon className="w-4 h-4 text-primary-600" /> Payment
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}
          </p>
          <div className="flex items-center gap-2">
            <span className={`badge text-xs ${statusColor(order.paymentStatus)}`}>
              {capitalise(order.paymentStatus)}
            </span>
            {order.isPaid && order.paidAt && (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {formatDate(order.paidAt)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap justify-center gap-3">
        <Link to="/orders" className="btn-primary gap-2">
          View All Orders <ChevronRight className="w-4 h-4" />
        </Link>
        <Link to="/products" className="btn-secondary">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
