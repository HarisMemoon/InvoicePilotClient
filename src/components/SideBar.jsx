import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FileText,
  Users,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  LayoutDashboard,
  MoreVertical,
  Sun,
  Moon,
  UserCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { Loader2 } from "lucide-react";

export default function Sidebar() {
  const { logout } = useAuth();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [loadingImage, setLoadingImage] = useState(false);

  const userJson = localStorage.getItem("user");
  let user = {};
  try {
    if (userJson) user = JSON.parse(userJson);
  } catch (err) {
    console.error("Failed to parse user from localStorage:", err);
    localStorage.removeItem("user");
  }

  // Sidebar links
  const links = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/dashboard/invoices", label: "Invoices", icon: FileText },
    { to: "/dashboard/clients", label: "Clients", icon: Users },
    { to: "/dashboard/reports", label: "Reports", icon: BarChart3 },
    { to: "/dashboard/profile-update", label: "Profile", icon: UserCircle },
  ];

  // ── Dark Mode Handling ──
  useEffect(() => {
    const saved = localStorage.getItem("darkMode") === "true";
    setDarkMode(saved);
    document.documentElement.classList.toggle("dark", saved);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);

    localStorage.setItem("darkMode", newMode);
    if (newMode) {
      document.documentElement.classList.add("dark");
      console.log(newMode);
    } else {
      document.documentElement.classList.remove("dark");
      console.log(newMode);
    }
  };

  // ── Responsive Sidebar ──
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileOpen(true);
      } else {
        setMobileOpen(false);
        setCollapsed(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const sidebarWidth = collapsed ? 72 : 260;

  // ── Menu Toggle ──
  const handleMenuToggle = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPosition({ x: rect.left, y: rect.top - 220 });
    setMenuOpen(!menuOpen);
  };

  return (
    <>
      {/* ── MOBILE TOGGLE ── */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 right-4 z-50 p-2.5 rounded-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg lg:hidden"
      >
        <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
      </button>

      {/* ── SIDEBAR ── */}
      <motion.aside
        initial={false}
        animate={{
          x: mobileOpen ? 0 : -320,
          width: sidebarWidth,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed inset-y-0 left-0 z-40 flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 overflow-hidden"
        style={{ width: sidebarWidth }}
      >
        {/* ── HEADER ── */}
        <div
          className={`flex items-center justify-between w-full px-5 py-4 border-b border-gray-100 dark:border-gray-800 ${
            collapsed ? "flex-col gap-2" : "flex-row gap-3"
          } transition-all duration-300`}
        >
          {/* 🌈 Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl blur-md opacity-70" />
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                IP
              </div>
            </div>

            {/* Title */}
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="overflow-hidden"
                >
                  <div className="text-lg font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                    InvoicePilot
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Smart Invoicing
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 🔘 Collapse Button */}
          <motion.button
            onClick={() => setCollapsed(!collapsed)}
            className={`p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-md transition-all hidden lg:flex ${
              collapsed ? "mt-2 self-center" : "ml-auto mr-2"
            }`}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div animate={{ rotate: collapsed ? 180 : 0 }}>
              {collapsed ? (
                <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              ) : (
                <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              )}
            </motion.div>
          </motion.button>
        </div>

        {/* ── NAV LINKS ── */}
        <nav className="flex-1 p-4 space-y-1">
          {links.map((l) => {
            const Icon = l.icon;
            const active =
              l.to === "/dashboard"
                ? location.pathname === "/dashboard"
                : location.pathname.startsWith(l.to);

            return (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => window.innerWidth < 1024 && setMobileOpen(false)}
                className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "text-blue-600 dark:text-blue-400 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20"
                    : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                } ${collapsed ? "justify-center" : ""}`}
              >
                <Icon
                  className={`w-5 h-5 ${
                    active
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200"
                  }`}
                />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="truncate"
                    >
                      {l.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>

        {/* ── USER PROFILE + MENU ── */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 relative">
          <div
            className={`flex items-center transition-all duration-300 ${
              collapsed
                ? "flex-col justify-center gap-2"
                : "justify-between gap-3"
            }`}
          >
            {/* PROFILE IMAGE */}
            <div
              className={`relative ${
                collapsed ? "w-12 h-12" : "w-10 h-10"
              } rounded-full overflow-hidden shadow-lg shrink-0`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full blur-md opacity-70 scale-110" />

              {user?.profile_image && !loadingImage ? (
                <img
                  src={user.profile_image}
                  alt="Profile"
                  className="relative w-full h-full object-cover transition-all duration-300"
                />
              ) : loadingImage ? (
                <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded-full">
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                </div>
              ) : (
                <div className="relative w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                  {user?.full_name?.[0]?.toUpperCase() ||
                    user?.email?.[0]?.toUpperCase() ||
                    "U"}
                </div>
              )}
            </div>

            {/* USER INFO */}
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="flex-1 min-w-0"
                >
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {user?.full_name || "User"}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user?.email}
                  </div>
                  {user?.company_name && (
                    <div className="text-xs text-blue-600 dark:text-blue-400 truncate">
                      {user.company_name}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* MENU BUTTON */}
            <motion.button
              onClick={handleMenuToggle}
              whileTap={{ scale: 0.9 }}
              className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all ${
                collapsed ? "absolute bottom-2 right-2" : "ml-auto"
              }`}
            >
              <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </motion.button>
          </div>
        </div>
      </motion.aside>

      {/* ── MENU PORTAL ── */}
      {menuOpen &&
        createPortal(
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            style={{
              position: "fixed",
              left: collapsed ? menuPosition.x - 40 : menuPosition.x - 180,
              top: menuPosition.y,
              zIndex: 9999,
            }}
            className="w-56 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={toggleDarkMode}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              {darkMode ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
              {darkMode ? "Light Mode" : "Dark Mode"}
            </button>

            <button
              onClick={logout}
              className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </motion.div>,
          document.body
        )}

      {/* ── MOBILE OVERLAY ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}
