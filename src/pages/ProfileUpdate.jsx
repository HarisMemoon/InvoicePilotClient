// src/pages/ProfileUpdate.jsx
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import axios from "axios";
import {
  User,
  Building,
  Mail,
  Camera,
  Save,
  Loader2,
  ShieldCheck,
  Edit2,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const API_BASE_URL = "http://localhost:5000/api/user/profile";

export default function ProfileUpdate() {
  const { updateUser } = useAuth();

  // State
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    full_name: "",
    company_name: "",
    role: "user",
    profile_image: "",
  });

  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState({
    fetch: true,
    upload: false,
    save: false,
  });
  const [errors, setErrors] = useState({});

  // Modern UX: Use a global edit state instead of per-field
  const [isEditing, setIsEditing] = useState(false);

  // Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const { data } = await axios.get(API_BASE_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const profile = data.profile || {};
        setUser(profile);

        setFormData({
          full_name: profile.full_name || "",
          company_name: profile.company_name || "",
          role: profile.role || "user",
          profile_image: profile.profile_image || "",
        });

        setImagePreview(profile.profile_image || "");
        if (updateUser) updateUser(profile);
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading((prev) => ({ ...prev, fetch: false }));
      }
    };

    const timeout = setTimeout(fetchProfile, 300);
    return () => clearTimeout(timeout);
  }, [updateUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Image upload
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image too large (max 5MB)");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Invalid image format");
      return;
    }

    setLoading((prev) => ({ ...prev, upload: true }));
    const reader = new FileReader();

    reader.onloadend = () => {
      const base64String = reader.result;
      setImagePreview(base64String);
      setFormData((prev) => ({ ...prev, profile_image: base64String }));
      setLoading((prev) => ({ ...prev, upload: false }));

      // Auto-save image when uploaded for better UX
      if (!isEditing) setIsEditing(true);
      toast.success("Image ready! Click save to keep changes.");
    };

    reader.onerror = () => {
      setLoading((prev) => ({ ...prev, upload: false }));
      toast.error("Image processing failed");
    };

    reader.readAsDataURL(file);
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.full_name.trim())
      newErrors.full_name = "Full name is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading((prev) => ({ ...prev, save: true }));

    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.put(API_BASE_URL, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const updatedProfile = data.profile;
      localStorage.setItem("user", JSON.stringify(updatedProfile));

      if (updateUser) updateUser(updatedProfile);
      setUser(updatedProfile);

      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading((prev) => ({ ...prev, save: false }));
    }
  };

  const cancelEdit = () => {
    // Reset form to last saved state
    setFormData({
      full_name: user?.full_name || "",
      company_name: user?.company_name || "",
      role: user?.role || "user",
      profile_image: user?.profile_image || "",
    });
    setImagePreview(user?.profile_image || "");
    setIsEditing(false);
    setErrors({});
  };

  if (loading.fetch) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
          <p className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-4 max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* HEADER */}
      <div className="mb-8 md:mb-12">
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-white tracking-tight">
          Account Settings
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1.5 text-sm sm:text-base">
          Manage your profile information and account details.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* LEFT COLUMN: IDENTITY CARD */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-4 flex flex-col items-center sm:items-start "
        >
          <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/10 rounded-2xl p-6 sm:p-8 w-full shadow-sm relative overflow-hidden group">
            {/* Background Accent */}
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/20 dark:to-purple-500/20" />

            <div className="relative flex flex-col items-center text-center mt-4">
              {/* AVATAR */}
              <div className="relative group/avatar">
                <div className="w-32 h-32 rounded-full ring-4 ring-white dark:ring-[#111827] bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 text-4xl font-semibold shadow-lg overflow-hidden">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    formData.full_name?.[0]?.toUpperCase() || (
                      <User className="w-12 h-12" />
                    )
                  )}
                </div>

                {/* Hover Upload Overlay */}
                <label
                  htmlFor="profile_image"
                  className="absolute inset-0 bg-black/50 text-white rounded-full flex flex-col items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm"
                >
                  {loading.upload ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <Camera className="w-6 h-6 mb-1" />
                      <span className="text-xs font-medium">Upload</span>
                    </>
                  )}
                  <input
                    id="profile_image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={loading.upload}
                  />
                </label>
              </div>

              <h2 className="mt-5 text-xl font-semibold text-gray-900 dark:text-white">
                {formData.full_name || "New User"}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                {user?.email || "No email provided"}
              </p>

              <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-xs font-medium tracking-wide capitalize border border-indigo-100 dark:border-indigo-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                {formData.role}
              </div>
            </div>
          </div>
        </motion.div>

        {/* RIGHT COLUMN: FORM */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-8"
        >
          <div className="bg-white dark:bg-[#111827] border border-gray-200 pb-5  dark:border-white/10 rounded-2xl shadow-sm overflow-hidden">
            {/* Form Header */}
            <div className="px-6 py-5 border-b border-gray-200 dark:border-white/10 flex items-center justify-between bg-gray-50/50 dark:bg-white/[0.02]">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                Profile Details
              </h3>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors bg-indigo-50 dark:bg-indigo-500/10 px-4 py-2 rounded-lg"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </button>
              ) : (
                <button
                  onClick={cancelEdit}
                  className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors px-4 py-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* FULL NAME */}
                <div className="space-y-2 col-span-1 sm:col-span-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Enter your full name"
                    className={`w-full px-4 py-2.5 rounded-xl border transition-all duration-200 text-sm ${
                      isEditing
                        ? "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-gray-900 dark:text-white"
                        : "bg-gray-50 dark:bg-white/5 border-transparent text-gray-700 dark:text-gray-300 cursor-not-allowed"
                    } outline-none`}
                  />
                  {errors.full_name && (
                    <p className="text-xs text-red-500">{errors.full_name}</p>
                  )}
                </div>

                {/* COMPANY NAME */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Building className="w-4 h-4 text-gray-400" />
                    Company Name
                  </label>
                  <input
                    type="text"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="e.g. Acme Corp"
                    className={`w-full px-4 py-2.5 rounded-xl border transition-all duration-200 text-sm ${
                      isEditing
                        ? "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-gray-900 dark:text-white"
                        : "bg-gray-50 dark:bg-white/5 border-transparent text-gray-700 dark:text-gray-300 cursor-not-allowed"
                    } outline-none`}
                  />
                </div>

                {/* ROLE */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-gray-400" />
                    Account Role
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full px-4 py-2.5 rounded-xl border transition-all duration-200 text-sm appearance-none ${
                      isEditing
                        ? "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-gray-900 dark:text-white cursor-pointer"
                        : "bg-gray-50 dark:bg-white/5 border-transparent text-gray-700 dark:text-gray-300 cursor-not-allowed"
                    } outline-none capitalize`}
                  >
                    <option value="user">User</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              {/* SAVE BUTTON - Only visible when editing */}
              <AnimatePresence>
                {isEditing && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: "auto", marginTop: 32 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-6 border-t border-gray-200 dark:border-white/10 flex justify-end">
                      <button
                        type="submit"
                        disabled={loading.save}
                        className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl transition-all shadow-sm shadow-indigo-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {loading.save ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" /> Saving
                            Changes...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" /> Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
