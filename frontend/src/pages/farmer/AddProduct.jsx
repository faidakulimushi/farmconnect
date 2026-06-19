import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { productService } from "../../services/productService";
import { categoryService } from "../../services/categoryService";
import { useAuth } from "../../context/AuthContext";
import { Upload, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

export default function AddProduct() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const backPath = user?.role === "admin" ? "/dashboard/admin/products" : "/dashboard/farmer/products";
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", price: "", category: "", quantity: "", unit: "kg", tags: "", isFeatured: false });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    categoryService.getAll().then(({ data }) => setCategories(data.categories || [])).catch(() => {});
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) { setImage(file); setPreview(URL.createObjectURL(file)); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.price || !form.category || !form.quantity) { toast.error("Please fill all required fields"); return; }
    if (!image) { toast.error("Please upload a product image"); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === "tags") fd.append(k, JSON.stringify(v.split(",").map(t => t.trim()).filter(Boolean)));
        else fd.append(k, v);
      });
      fd.append("image", image);

      const { data } = await productService.create(fd);
      // Verify the image was saved by checking the response
      if (!data.product?.image) {
        toast.success("Product listed! Image upload may have failed — you can re-upload via Edit.");
      } else {
        toast.success("Product listed successfully with image!");
      }
      navigate(backPath);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in max-w-2xl">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Add New Product</h1>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        {/* Image upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Product Image <span className="text-red-500">*</span>
          </label>
          <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:border-primary-400 transition-colors overflow-hidden">
            {preview ? (
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Click to upload image</p>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP – max 5MB</p>
              </div>
            )}
            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          </label>
          {image && (
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              ✓ Selected: {image.name}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Product Title *</label>
          <input id="title" name="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Fresh Organic Tomatoes" className="input" required />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description *</label>
          <textarea id="description" name="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} placeholder="Describe your product…" className="input resize-none" required />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Price ($) *</label>
            <input id="price" name="price" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} min={0} step={0.01} placeholder="0.00" className="input" required />
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category *</label>
            <select id="category" name="category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input" required>
              <option value="">Select category</option>
              {(categories || []).map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Stock Quantity *</label>
            <input id="quantity" name="quantity" type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} min={0} placeholder="0" className="input" required />
          </div>
          <div>
            <label htmlFor="unit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Unit</label>
            <select id="unit" name="unit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="input">
              {["kg", "g", "litre", "ml", "piece", "dozen", "bunch"].map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Tags (comma-separated)</label>
          <input id="tags" name="tags" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="organic, fresh, local" className="input" />
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} className="w-4 h-4 rounded text-primary-600" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Mark as Featured Product</span>
        </label>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="btn-primary flex-1 py-3">
            {loading ? "Publishing…" : "Publish Product"}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary px-6">Cancel</button>
        </div>
      </form>
    </div>
  );
}
