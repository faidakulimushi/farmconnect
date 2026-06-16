import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";

// ── Public Pages ─────────────────────────────────────────────────────────────
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

// ── Auth-Required Pages ───────────────────────────────────────────────────────
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Wishlist from "./pages/Wishlist";
import Profile from "./pages/Profile";
import OrderHistory from "./pages/OrderHistory";
import OrderConfirmation from "./pages/OrderConfirmation";

// ── Customer Dashboard ─────────────────────────────────────────────────────────
import CustomerDashboard from "./pages/customer/CustomerDashboard";

// ── Farmer Dashboard ───────────────────────────────────────────────────────────
import FarmerDashboard from "./pages/farmer/FarmerDashboard";
import FarmerProducts from "./pages/farmer/FarmerProducts";
import FarmerOrders from "./pages/farmer/FarmerOrders";
import AddProduct from "./pages/farmer/AddProduct";
import EditProduct from "./pages/farmer/EditProduct";
import FarmerProfile from "./pages/farmer/FarmerProfile";

// ── Admin Dashboard ────────────────────────────────────────────────────────────
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageProducts from "./pages/admin/ManageProducts";
import ManageOrders from "./pages/admin/ManageOrders";
import ManageCategories from "./pages/admin/ManageCategories";

export default function App() {
  return (
    <Routes>
      {/* Public routes – rendered inside MainLayout (Navbar + Footer) */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/wishlist" element={<Wishlist />} />

        {/* Protected – any authenticated user */}
        <Route element={<ProtectedRoute />}>
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/orders" element={<OrderHistory />} />
          <Route path="/orders/:id" element={<OrderConfirmation />} />
        </Route>

        {/* /dashboard/customer → redirect customers to home */}
        <Route path="/dashboard/customer" element={<Navigate to="/" replace />} />
      </Route>

      {/* Farmer routes – DashboardLayout (sidebar) */}
      <Route element={<ProtectedRoute allowedRoles={["farmer"]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard/farmer" element={<FarmerDashboard />} />
          <Route path="/dashboard/farmer/products" element={<FarmerProducts />} />
          <Route path="/dashboard/farmer/products/add" element={<AddProduct />} />
          <Route path="/dashboard/farmer/products/edit/:id" element={<EditProduct />} />
          <Route path="/dashboard/farmer/orders" element={<FarmerOrders />} />
          <Route path="/dashboard/farmer/profile" element={<FarmerProfile />} />
        </Route>
      </Route>

      {/* Admin routes – DashboardLayout (sidebar) */}
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
          <Route path="/dashboard/admin/users" element={<ManageUsers />} />
          <Route path="/dashboard/admin/products" element={<ManageProducts />} />
          <Route path="/dashboard/admin/products/add" element={<AddProduct />} />
          <Route path="/dashboard/admin/products/edit/:id" element={<EditProduct />} />
          <Route path="/dashboard/admin/orders" element={<ManageOrders />} />
          <Route path="/dashboard/admin/categories" element={<ManageCategories />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
