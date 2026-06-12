import { useState } from "react";
import { Link, useNavigate, useSearchParams, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Sprout, Eye, EyeOff, User, Tractor } from "lucide-react";
import toast from "react-hot-toast";

export default function Register() {
  const [searchParams] = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(searchParams.get("role") || "customer");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    const dashboards = { farmer: "/dashboard/farmer", admin: "/dashboard/admin", customer: "/" };
    return <Navigate to={dashboards[user?.role] || "/"} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) { toast.error("Please fill in all fields"); return; }
    if (password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      const data = await register(name, email, password, role);
      toast.success(`Welcome to AgriLink, ${data.user.name}!`);
      const dashboards = { farmer: "/dashboard/farmer", admin: "/dashboard/admin", customer: "/" };
      navigate(dashboards[data.user.role] || "/", { replace: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12 bg-gray-50 dark:bg-gray-950">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <div className="w-14 h-14 rounded-2xl bg-primary-600 flex items-center justify-center shadow-lg shadow-primary-600/30">
              <Sprout className="w-7 h-7 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create your account</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Join thousands of users on AgriLink</p>
        </div>

        <div className="card p-8 shadow-sm">
          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { value: "customer", label: "Customer", icon: User, desc: "Buy fresh produce" },
              { value: "farmer", label: "Farmer", icon: Tractor, desc: "Sell your products" },
            ].map(({ value, label, icon: Icon, desc }) => (
              <button
                key={value}
                type="button"
                onClick={() => setRole(value)}
                className={`p-4 rounded-xl border-2 text-left transition-colors ${role === value ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20" : "border-gray-200 dark:border-gray-700 hover:border-primary-300"}`}
              >
                <Icon className={`w-5 h-5 mb-1.5 ${role === value ? "text-primary-600" : "text-gray-400"}`} />
                <p className="font-semibold text-sm text-gray-900 dark:text-white">{label}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" className="input" required autoComplete="name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="input" required autoComplete="email" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" className="input pr-10" required autoComplete="new-password" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base mt-2">
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
