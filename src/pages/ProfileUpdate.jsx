// src/pages/ProfileUpdate.jsx
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import Confetti from "react-confetti";
import axios from "axios";
import {
  User,
  Building,
  Mail,
  Camera,
  Save,
  Loader2,
  Sparkles,
  Shield,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
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
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [isEditing, setIsEditing] = useState({});

  // Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.warn("No token found. User might not be logged in yet.");
        return;
      }

      try {
        const { data } = await axios.get(
          "http://localhost:5000/api/user/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const profile = data.profile || {};
        setUser(profile);
        console.log("Fetched profile:", data.profile);

        setFormData({
          full_name: profile.full_name || "",
          company_name: profile.company_name || "",
          role: profile.role || "user",
          profile_image: profile.profile_image || "",
        });

        setImagePreview(profile.profile_image || "");
        updateUser && updateUser(profile);
      } catch (err) {
        console.error("Profile fetch failed:", err);
        toast.error(err.response?.data?.message || "Failed to load profile");
      }
    };

    // Small delay ensures token is available if set right after login
    const timeout = setTimeout(fetchProfile, 300);

    return () => clearTimeout(timeout);
  }, []);

  // Toggle edit
  const toggleEdit = (field) => {
    setIsEditing((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  // Input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Single 10MB limit
    if (file.size > 10 * 1024 * 1024) {
      setErrors({ profile_image: "Image too large (max 10MB)" });
      return;
    }

    // Validate image type
    if (!file.type.startsWith("image/")) {
      setErrors({ profile_image: "Invalid image format" });
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setImagePreview(base64String); // Set preview
        setFormData((prev) => ({ ...prev, profile_image: base64String })); // Update form data
        setErrors({}); // Clear any previous errors
        toast.success("Image ready to upload!");
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setErrors({ profile_image: "Failed to process image" });
      toast.error("Image processing failed");
    } finally {
      setUploading(false);
    }
  };
  // Validation
  const validate = () => {
    const newErrors = {};
    if (!formData.full_name.trim())
      newErrors.full_name = "Full name is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);

    try {
      const { data } = await axios.put(
        "http://localhost:5000/api/user/profile",
        formData,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      // ONLY UPDATE USER, DO NOT TOUCH TOKEN
      localStorage.setItem("user", JSON.stringify(data.profile));

      const updatedProfile = data.profile;
      if (updatedProfile) {
        updateUser(updatedProfile); // updates context + localStorage
      }
      setUser(updatedProfile);
      toast.success("Profile updated!");

      setIsEditing({});
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  // UI — INSIDE DASHBOARD LAYOUT
  return (
    <>
      <div className="p-4 sm:p-6 md:p-8 lg:p-10">
        <div className="max-w-4xl mx-auto">
          {/* HEADER */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Profile Playground
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Edit everything — make it yours!
            </p>
          </motion.div>

          {/* CARD */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 lg:p-12 border border-white/30 dark:border-gray-700"
          >
            {/* AVATAR SECTION */}
            <div className="flex flex-col items-center mb-12">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full blur-xl opacity-70 scale-110 animate-pulse" />
                <div className="relative w-40 h-40 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-6xl font-bold shadow-2xl overflow-hidden">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    formData.full_name[0]?.toUpperCase() || "U"
                  )}
                </div>
                <label
                  htmlFor="profile_image"
                  className="absolute bottom-2 right-2 bg-white dark:bg-gray-800 p-3 rounded-full shadow-xl cursor-pointer group-hover:scale-110 transition-all"
                >
                  {uploading ? (
                    <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                  ) : (
                    <Camera className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  )}
                  <input
                    id="profile_image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </motion.div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                Click camera to change photo (max 5MB)
              </p>
              {errors.profile_image && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {errors.profile_image}
                </p>
              )}
            </div>

            {/* FORM FIELDS */}
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* FULL NAME */}
              <div className="relative group">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Full Name
                    <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => toggleEdit("full_name")}
                    className="text-blue-600 dark:text-blue-400 text-xs hover:underline"
                  >
                    {isEditing.full_name ? "Done" : "Edit"}
                  </button>
                </div>
                <AnimatePresence>
                  {isEditing.full_name ? (
                    <motion.input
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      required
                      placeholder="John Doe"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none transition-all text-gray-900 dark:text-gray-100 placeholder-gray-400"
                    />
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl text-gray-900 dark:text-gray-100"
                    >
                      {formData.full_name || "Not set"}
                    </motion.div>
                  )}
                </AnimatePresence>
                {errors.full_name && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {errors.full_name}
                  </p>
                )}
              </div>

              {/* COMPANY NAME */}
              <div className="relative group">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    Company Name
                  </label>
                  <button
                    type="button"
                    onClick={() => toggleEdit("company_name")}
                    className="text-blue-600 dark:text-blue-400 text-xs hover:underline"
                  >
                    {isEditing.company_name ? "Done" : "Edit"}
                  </button>
                </div>
                <AnimatePresence>
                  {isEditing.company_name ? (
                    <motion.input
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      type="text"
                      name="company_name"
                      value={formData.company_name}
                      onChange={handleChange}
                      placeholder="Acme Corp"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none transition-all text-gray-900 dark:text-gray-100 placeholder-gray-400"
                    />
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl text-gray-900 dark:text-gray-100"
                    >
                      {formData.company_name || "Not set"}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* EMAIL (READ-ONLY) */}
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email Address
                  </label>
                </div>
                <div className="px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl text-gray-600 dark:text-gray-400">
                  {user?.email || "Not set"}
                </div>
              </div>

              {/* ROLE (SELECT) */}
              <div className="relative group">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Role
                  </label>
                  <button
                    type="button"
                    onClick={() => toggleEdit("role")}
                    className="text-blue-600 dark:text-blue-400 text-xs hover:underline"
                  >
                    {isEditing.role ? "Done" : "Edit"}
                  </button>
                </div>
                <AnimatePresence>
                  {isEditing.role ? (
                    <motion.select
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none transition-all text-gray-900 dark:text-gray-100"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                      <option value="manager">Manager</option>
                    </motion.select>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl text-gray-900 dark:text-gray-100 flex items-center gap-2"
                    >
                      <Shield className="w-4 h-4 text-blue-600" />
                      {formData.role}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* SAVE BUTTON */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={saving}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg rounded-xl shadow-2xl hover:shadow-3xl hover:from-blue-700 hover:to-purple-700 transform transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-70"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-6 h-6" />
                    Save All Changes
                  </>
                )}
              </motion.button>
            </form>

            {/* FUN FOOTER */}
            <div className="mt-12 text-center">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-block"
              >
                <Sparkles className="w-8 h-8 text-yellow-500" />
              </motion.div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Every change makes your profile more awesome!
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
