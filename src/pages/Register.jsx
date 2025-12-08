// src/pages/Register.jsx
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, Building } from "lucide-react";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    company_name: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ── VALIDATION LOGIC ─────────────────────────────────────
  const validate = () => {
    const newErrors = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Password must contain a letter and a number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── HANDLE INPUT CHANGE ──────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error on typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // ── HANDLE SUBMIT ────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    const res = await register(
      formData.full_name,
      formData.email,
      formData.password,
      formData.company_name // optional
    );

    if (res.success) {
      navigate("/dashboard");
    } else {
      setErrors({ submit: res.message || "Registration failed" });
    }

    setLoading(false);
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-indigo-900/30 dark:to-purple-900/30 p-6 font-inter">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg"
      >
        {/* SQUARE GLASS CARD */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-2xl rounded-2xl shadow-2xl p-10 border border-white/30 dark:border-gray-700">
          {/* LOGO */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl blur-xl opacity-70 scale-110" />
              <div className="relative w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-2xl">
                IP
              </div>
            </div>
          </div>

          {/* TITLE */}
          <h2 className="text-center text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
            Create Account
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-10">
            Join InvoicePilot and start invoicing smarter
          </p>

          {/* SERVER ERROR */}
          {errors.submit && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl text-sm flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              {errors.submit}
            </motion.div>
          )}

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* FULL NAME */}
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                required
                placeholder="John Doe"
                className={`w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-700 border ${
                  errors.full_name
                    ? "border-red-500"
                    : "border-gray-200 dark:border-gray-600"
                } rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all text-gray-900 dark:text-gray-100 placeholder-gray-400 text-base`}
              />
              <label className="absolute -top-3 left-4 bg-white dark:bg-gray-800 px-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                Full Name <span className="text-red-500">*</span>
              </label>
              {errors.full_name && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {errors.full_name}
                </p>
              )}
            </div>

            {/* EMAIL */}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                className={`w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-700 border ${
                  errors.email
                    ? "border-red-500"
                    : "border-gray-200 dark:border-gray-600"
                } rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all text-gray-900 dark:text-gray-100 placeholder-gray-400 text-base`}
              />
              <label className="absolute -top-3 left-4 bg-white dark:bg-gray-800 px-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                Email Address <span className="text-red-500">*</span>
              </label>
              {errors.email && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {errors.email}
                </p>
              )}
            </div>

            {/* PASSWORD */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className={`w-full pl-12 pr-14 py-4 bg-gray-50 dark:bg-gray-700 border ${
                  errors.password
                    ? "border-red-500"
                    : "border-gray-200 dark:border-gray-600"
                } rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all text-gray-900 dark:text-gray-100 placeholder-gray-400 text-base`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
              <label className="absolute -top-3 left-4 bg-white dark:bg-gray-800 px-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                Password <span className="text-red-500">*</span>
              </label>
              {errors.password && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {errors.password}
                </p>
              )}
            </div>

            {/* COMPANY NAME (OPTIONAL) */}
            <div className="relative">
              <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                placeholder="Acme Corp (optional)"
                className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all text-gray-900 dark:text-gray-100 placeholder-gray-400 text-base"
              />
              <label className="absolute -top-3 left-4 bg-white dark:bg-gray-800 px-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                Company Name
              </label>
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg rounded-xl shadow-xl hover:shadow-2xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2 ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  </motion.div>
                  Creating Account...
                </>
              ) : (
                "Sign Up"
              )}
            </button>
          </form>

          {/* LOGIN LINK */}
          <p className="text-center mt-8 text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline"
            >
              Login here
            </Link>
          </p>
        </div>

        {/* FOOTER */}
        <p className="text-center mt-8 text-sm text-gray-500 dark:text-gray-400">
          © 2025 InvoicePilot. Smart Invoicing.
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
