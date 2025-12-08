// src/pages/LoginPage.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      // Optional: small delay so UI feels snappy
      setTimeout(() => navigate("/dashboard"), 100);
    } else {
      setError(result.message);
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
            Welcome Back
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-10">
            Sign in to manage your invoices
          </p>

          {/* ERROR */}
          {error && (
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
              {error}
            </motion.div>
          )}

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* EMAIL */}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all text-gray-900 dark:text-gray-100 placeholder-gray-400 text-base"
              />
              <label className="absolute -top-3 left-4 bg-white dark:bg-gray-800 px-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                Email Address
              </label>
            </div>

            {/* PASSWORD */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full pl-12 pr-14 py-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all text-gray-900 dark:text-gray-100 placeholder-gray-400 text-base"
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
                Password
              </label>
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg rounded-xl shadow-xl hover:shadow-2xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-[1.02] transition-all duration-200"
            >
              Sign In
            </button>
          </form>

          {/* REGISTER */}
          <p className="text-center mt-8 text-gray-600 dark:text-gray-400">
            Don’t have an account?{" "}
            <Link
              to="/register"
              className="font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline"
            >
              Register here
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
}
