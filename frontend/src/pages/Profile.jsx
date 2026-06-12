import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { userService } from "../services/userService";
import { User, Lock, Save } from "lucide-react";
import toast from "react-hot-toast";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    farmName: user?.farmName || "",
    farmDescription: user?.farmDescription || "",
    farmLocation: user?.farmLocation || "",
  });
  const [password, setPassword] = useState({ current: "", newPass: "", confirm: "" });
  const [saving, setSaving] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await userService.updateProfile(form);
      updateUser(data.user);
      toast.success("Profile updated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (password.newPass !== password.confirm) { toast.error("Passwords do not match"); return; }
    if (password.newPass.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setSaving(true);
    try {
      await userService.updateProfile({ password: password.newPass });
      toast.success("Password updated!");
      setPassword({ current: "", newPass: "", confirm: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container-custom py-8 animate-fade-in max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">My Profile</h1>

      <div className="space-y-6">
        {/* Profile info */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-5">
            <User className="w-5 h-5 text-primary-600" />
            <h2 className="font-bold text-gray-900 dark:text-white">Personal Information</h2>
          </div>
          <form onSubmit={handleProfileSave} className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 flex items-center gap-4 mb-2">
              <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold text-2xl">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{user?.name}</p>
                <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
              </div>
            </div>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
              <input id="name" name="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" required autoComplete="name" />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Phone</label>
              <input id="phone" name="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input" placeholder="+1 (555) 000-0000" autoComplete="tel" />
            </div>
            {user?.role === "farmer" && (
              <>
                <div>
                  <label htmlFor="farmName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Farm Name</label>
                  <input id="farmName" name="farmName" value={form.farmName} onChange={(e) => setForm({ ...form, farmName: e.target.value })} className="input" autoComplete="organization" />
                </div>
                <div>
                  <label htmlFor="farmLocation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Farm Location</label>
                  <input id="farmLocation" name="farmLocation" value={form.farmLocation} onChange={(e) => setForm({ ...form, farmLocation: e.target.value })} className="input" placeholder="City, Country" autoComplete="address-level2" />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="farmDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Farm Description</label>
                  <textarea id="farmDescription" name="farmDescription" value={form.farmDescription} onChange={(e) => setForm({ ...form, farmDescription: e.target.value })} rows={3} className="input resize-none" />
                </div>
              </>
            )}
            <div className="sm:col-span-2">
              <button type="submit" disabled={saving} className="btn-primary gap-2">
                <Save className="w-4 h-4" /> {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </form>
        </div>

        {/* Password */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-5">
            <Lock className="w-5 h-5 text-primary-600" />
            <h2 className="font-bold text-gray-900 dark:text-white">Change Password</h2>
          </div>
          <form onSubmit={handlePasswordChange} className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="newPass" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">New Password</label>
              <input id="newPass" name="newPass" type="password" value={password.newPass} onChange={(e) => setPassword({ ...password, newPass: e.target.value })} className="input" placeholder="Min 6 characters" required autoComplete="new-password" />
            </div>
            <div>
              <label htmlFor="confirmPass" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Confirm Password</label>
              <input id="confirmPass" name="confirmPass" type="password" value={password.confirm} onChange={(e) => setPassword({ ...password, confirm: e.target.value })} className="input" placeholder="Repeat new password" required autoComplete="new-password" />
            </div>
            <div className="sm:col-span-2">
              <button type="submit" disabled={saving} className="btn-secondary gap-2">
                <Lock className="w-4 h-4" /> {saving ? "Updating…" : "Update Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
