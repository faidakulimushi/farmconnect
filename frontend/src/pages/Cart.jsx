import { Link } from "react-router-dom";
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from "lucide-react";
import { useCart } from "../context/CartContext";
import { formatCurrency } from "../utils/helpers";
import { PLACEHOLDER_IMAGE } from "../utils/constants";
import LoadingSpinner from "../components/LoadingSpinner";

export default function Cart() {
  const { items, total, loading, updateQuantity, removeItem, clearCart } = useCart();

  if (loading) return <LoadingSpinner text="Loading cart…" />;

  if (!items.length) {
    return (
      <div className="container-custom py-20 text-center animate-fade-in">
        <ShoppingBag className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Discover fresh produce and add to your cart.</p>
        <Link to="/products" className="btn-primary">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="container-custom py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Shopping Cart ({items.length})</h1>
        <button onClick={clearCart} className="text-sm text-red-500 hover:underline flex items-center gap-1">
          <Trash2 className="w-4 h-4" /> Clear cart
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(({ product, quantity }) => (
            <div key={product._id} className="card p-4 flex gap-4">
              <img src={product.image || PLACEHOLDER_IMAGE} alt={product.title} className="w-20 h-20 rounded-xl object-cover bg-gray-100" onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }} />
              <div className="flex-1 min-w-0">
                <Link to={`/products/${product._id}`} className="font-semibold text-gray-900 dark:text-white hover:text-primary-600 text-sm line-clamp-2">{product.title}</Link>
                <p className="text-primary-600 dark:text-primary-400 font-bold mt-1">{formatCurrency(product.price)} / {product.unit || "kg"}</p>
                <div className="flex items-center justify-between mt-3">
                  {/* Quantity control */}
                  <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                    <button onClick={() => quantity > 1 ? updateQuantity(product._id, quantity - 1) : removeItem(product._id)} className="px-2.5 py-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-l-lg">
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 py-1 text-sm font-semibold border-x border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">{quantity}</span>
                    <button onClick={() => updateQuantity(product._id, quantity + 1)} disabled={quantity >= product.quantity} className="px-2.5 py-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-r-lg disabled:opacity-40">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(product.price * quantity)}</span>
                    <button onClick={() => removeItem(product._id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div>
          <div className="card p-6 sticky top-20">
            <h2 className="font-bold text-gray-900 dark:text-white text-lg mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm border-b border-gray-100 dark:border-gray-700 pb-4 mb-4">
              {items.map(({ product, quantity }) => (
                <div key={product._id} className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span className="truncate max-w-[180px]">{product.title} × {quantity}</span>
                  <span>{formatCurrency(product.price * quantity)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-bold text-gray-900 dark:text-white mb-5">
              <span>Total</span>
              <span className="text-primary-600 dark:text-primary-400">{formatCurrency(total)}</span>
            </div>
            <Link to="/checkout" className="btn-primary w-full justify-center gap-2 text-base py-3">
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/products" className="block text-center text-sm text-primary-600 dark:text-primary-400 hover:underline mt-3">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
