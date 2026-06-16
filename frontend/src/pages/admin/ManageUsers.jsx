import { useState, useEffect } from "react";
import { userService } from "../../services/userService";
import { useAuth } from "../../context/AuthContext";
import { formatDate, capitalise } from "../../utils/helpers";
import { Trash2, Search, ShieldCheck, ShieldOff, UserX, UserCheck } from "lucide-react";
import LoadingSpinner from "../../components/LoadingSpinner";
import toast from "react-hot-toast";

// ── Confirmation Modal ────────────────────────────────────────────────────────
function ConfirmModal({ open, title, message, confirmLabel, confirmClass, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative card p-6 w-full max-w-sm shadow-xl animate-fade-in">
        <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="btn-secondary btn-sm">Cancel</button>
          <button onClick={onConfirm} className={`btn-sm px-4 py-2 rounded-lg font-medium text-white transition-colors ${confirmClass}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Role badge ────────────────────────────────────────────────────────────────
function RoleBadge({ role }) {
  const styles = {
    admin: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    farmer: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    customer: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  };
  return (
    <span className={`badge ${styles[role] || styles.customer}`}>
      {capitalise(role)}
    </span>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ManageUsers() {
  const { user: currentAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [modal, setModal] = useState(null); // { type, user }

  const fetchUsers = () => {
    setLoading(true);
    userService.getAll({ role: roleFilter || undefined })
      .then(({ data }) => setUsers(data.users || []))
      .catch(() => toast.error("Failed to load users"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, [roleFilter]);

  // ── Actions ──────────────────────────────────────────────────────────────
  const confirmAction = (type, user) => setModal({ type, user });
  const closeModal = () => setModal(null);

  const executeAction = async () => {
    const { type, user } = modal;
    closeModal();
    try {
      if (type === "promote") {
        await userService.promoteToAdmin(user._id);
        setUsers((prev) => prev.map((u) => u._id === user._id ? { ...u, role: "admin" } : u));
        toast.success(`${user.name} is now an admin`);
      } else if (type === "demote") {
        await userService.demoteFromAdmin(user._id);
        setUsers((prev) => prev.map((u) => u._id === user._id ? { ...u, role: "customer" } : u));
        toast.success(`${user.name}'s admin privileges removed`);
      } else if (type === "deactivate") {
        await userService.update(user._id, { isActive: false });
        setUsers((prev) => prev.map((u) => u._id === user._id ? { ...u, isActive: false } : u));
        toast.success(`${user.name} deactivated`);
      } else if (type === "activate") {
        await userService.update(user._id, { isActive: true });
        setUsers((prev) => prev.map((u) => u._id === user._id ? { ...u, isActive: true } : u));
        toast.success(`${user.name} activated`);
      } else if (type === "delete") {
        await userService.delete(user._id);
        setUsers((prev) => prev.filter((u) => u._id !== user._id));
        toast.success("User deleted");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    }
  };

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  // ── Modal config ──────────────────────────────────────────────────────────
  const modalConfig = {
    promote: {
      title: "Promote to Admin",
      message: `Grant admin privileges to "${modal?.user?.name}"? They will have full access to the admin dashboard.`,
      confirmLabel: "Yes, Promote",
      confirmClass: "bg-purple-600 hover:bg-purple-700",
    },
    demote: {
      title: "Remove Admin Privileges",
      message: `Remove admin access from "${modal?.user?.name}"? They will become a regular customer.`,
      confirmLabel: "Yes, Remove",
      confirmClass: "bg-orange-600 hover:bg-orange-700",
    },
    deactivate: {
      title: "Deactivate User",
      message: `Deactivate "${modal?.user?.name}"? They won't be able to log in.`,
      confirmLabel: "Deactivate",
      confirmClass: "bg-red-600 hover:bg-red-700",
    },
    activate: {
      title: "Activate User",
      message: `Re-activate "${modal?.user?.name}"?`,
      confirmLabel: "Activate",
      confirmClass: "bg-green-600 hover:bg-green-700",
    },
    delete: {
      title: "Delete User",
      message: `Permanently delete "${modal?.user?.name}"? This cannot be undone.`,
      confirmLabel: "Delete",
      confirmClass: "bg-red-600 hover:bg-red-700",
    },
  };
  const cfg = modal ? modalConfig[modal.type] : {};

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Manage Users</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Promote users to admin or manage their access. Only admins can grant admin privileges.
      </p>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="input pl-9 text-sm"
          />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="input text-sm w-auto">
          <option value="">All Roles</option>
          <option value="customer">Customer</option>
          <option value="farmer">Farmer</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr className="text-left text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filtered.map((u) => {
                  const isSelf = u._id === currentAdmin?._id;
                  return (
                    <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      {/* User info */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-xs font-bold text-primary-700 dark:text-primary-300 shrink-0">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {u.name}
                              {isSelf && <span className="ml-1.5 text-xs text-primary-500">(you)</span>}
                            </p>
                            <p className="text-xs text-gray-400">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-4 py-3"><RoleBadge role={u.role} /></td>

                      {/* Joined */}
                      <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(u.createdAt)}</td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span className={`badge ${u.isActive ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
                          {u.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {/* Promote / Demote – disabled for self */}
                          {!isSelf && u.role !== "admin" && (
                            <button
                              onClick={() => confirmAction("promote", u)}
                              className="p-1.5 rounded-lg text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                              title="Promote to Admin"
                            >
                              <ShieldCheck className="w-4 h-4" />
                            </button>
                          )}
                          {!isSelf && u.role === "admin" && (
                            <button
                              onClick={() => confirmAction("demote", u)}
                              className="p-1.5 rounded-lg text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
                              title="Remove Admin Privileges"
                            >
                              <ShieldOff className="w-4 h-4" />
                            </button>
                          )}

                          {/* Activate / Deactivate */}
                          {!isSelf && (
                            u.isActive ? (
                              <button
                                onClick={() => confirmAction("deactivate", u)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                title="Deactivate user"
                              >
                                <UserX className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => confirmAction("activate", u)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                                title="Activate user"
                              >
                                <UserCheck className="w-4 h-4" />
                              </button>
                            )
                          )}

                          {/* Delete – disabled for self */}
                          {!isSelf && (
                            <button
                              onClick={() => confirmAction("delete", u)}
                              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              title="Delete user"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}

                          {isSelf && (
                            <span className="text-xs text-gray-400 italic px-1">—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <p className="text-center text-gray-500 dark:text-gray-400 py-10 text-sm">No users found.</p>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        open={!!modal}
        title={cfg.title}
        message={cfg.message}
        confirmLabel={cfg.confirmLabel}
        confirmClass={cfg.confirmClass}
        onConfirm={executeAction}
        onCancel={closeModal}
      />
    </div>
  );
}
