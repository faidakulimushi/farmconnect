import { useState, useEffect } from "react";
import { categoryService } from "../../services/categoryService";
import { Plus, Edit2, Trash2, Check, X } from "lucide-react";
import LoadingSpinner from "../../components/LoadingSpinner";
import toast from "react-hot-toast";

export default function ManageCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");

  const fetchCategories = () => {
    categoryService.getAll().then(({ data }) => setCategories(data.categories || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newName.trim()) { toast.error("Name is required"); return; }
    setAdding(true);
    try {
      await categoryService.create({ name: newName, description: newDesc });
      toast.success("Category created");
      setNewName(""); setNewDesc("");
      fetchCategories();
    } catch (err) { toast.error(err.response?.data?.message || "Failed to create"); }
    finally { setAdding(false); }
  };

  const handleEdit = async (id) => {
    if (!editName.trim()) { setEditingId(null); return; }
    try {
      await categoryService.update(id, { name: editName });
      toast.success("Category updated");
      setEditingId(null);
      fetchCategories();
    } catch { toast.error("Update failed"); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete category "${name}"?`)) return;
    try {
      await categoryService.delete(id);
      toast.success("Category deleted");
      setCategories((prev) => prev.filter((c) => c._id !== id));
    } catch { toast.error("Delete failed"); }
  };

  return (
    <div className="animate-fade-in max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Manage Categories</h1>

      {/* Add form */}
      <div className="card p-5 mb-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Add New Category</h2>
        <form onSubmit={handleAdd} className="flex flex-col gap-3">
          <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Category name *" className="input" required />
          <input value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Description (optional)" className="input" />
          <button type="submit" disabled={adding} className="btn-primary btn-sm self-start gap-2">
            <Plus className="w-4 h-4" /> {adding ? "Adding…" : "Add Category"}
          </button>
        </form>
      </div>

      {/* List */}
      {loading ? <LoadingSpinner /> : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr className="text-left text-xs text-gray-500 dark:text-gray-400">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Slug</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {(categories || []).map((c) => (
                  <tr key={c._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3">
                      {editingId === c._id ? (
                        <input value={editName} onChange={(e) => setEditName(e.target.value)} className="input text-sm py-1" autoFocus />
                      ) : (
                        <span className="font-medium text-gray-900 dark:text-white">{c.name}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{c.slug}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {editingId === c._id ? (
                          <>
                            <button onClick={() => handleEdit(c._id)} className="p-1.5 rounded-lg text-green-500 hover:bg-green-50"><Check className="w-4 h-4" /></button>
                            <button onClick={() => setEditingId(null)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"><X className="w-4 h-4" /></button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => { setEditingId(c._id); setEditName(c.name); }} className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50"><Edit2 className="w-4 h-4" /></button>
                            <button onClick={() => handleDelete(c._id, c.name)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {categories.length === 0 && <p className="text-center text-gray-500 py-8 text-sm">No categories yet.</p>}
          </div>
        </div>
      )}
    </div>
  );
}
