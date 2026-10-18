import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FileText,
  Users,
  BarChart3,
  LogOut,
  ChevronLeft,
  Menu,
  LayoutDashboard,
  MoreVertical,
  Sun,
  Moon,
  UserCircle,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { Loader2 } from "lucide-react";
import { useTheme } from "../hooks/useDarkMode";

export default function Sidebar() {
  const { logout } = useAuth();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ left: 0, bottom: 0 });
  const [loadingImage, setLoadingImage] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  // Refs to detect clicks outside the menu
  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  const userJson = localStorage.getItem("user");
  let user = {};
  try {
    if (userJson) user = JSON.parse(userJson);
  } catch (err) {
    console.error("Failed to parse user from localStorage:", err);
    localStorage.removeItem("user");
  }

  const links = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/dashboard/invoices", label: "Invoices", icon: FileText },
    { to: "/dashboard/clients", label: "Clients", icon: Users },
    { to: "/dashboard/reports", label: "Reports", icon: BarChart3 },
    { to: "/dashboard/profile-update", label: "Profile", icon: UserCircle },
  ];

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

  // ── Menu Toggle & Position ──
  const handleMenuToggle = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPosition({
      // If collapsed, open to the right. If open, align right edge of menu (224px wide) with right edge of button
      left: collapsed ? rect.right + 16 : rect.right - 224,
      // Place right above the button
      bottom: window.innerHeight - rect.top + 10,
    });
    setMenuOpen(!menuOpen);
  };

  // Close menu if clicked outside of BOTH the button and the menu
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        menuOpen &&
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  return (
    <>
      {/* ── MOBILE TOGGLE ── */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 right-4 z-50 p-2.5 rounded-xl bg-white dark:bg-gray-800 shadow-lg lg:hidden"
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
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                IP
              </div>
            </div>

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

          {/* Collapse Button */}
          <motion.button
            onClick={() => setCollapsed(!collapsed)}
            className={`p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-md transition-all hidden lg:flex ${
              collapsed ? "mt-2 self-center" : "ml-auto mr-2"
            }`}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={{ rotate: collapsed ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
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
            <div
              className={`flex items-center gap-1 ${collapsed ? "flex-col" : "ml-auto"}`}
            >
              {/* THEME TOGGLE ICON */}
              <motion.button
                onClick={toggleTheme}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDark ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </motion.button>

              {/* MENU BUTTON */}
              <motion.button
                ref={buttonRef}
                onClick={handleMenuToggle}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              >
                <MoreVertical className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* ── MENU PORTAL ── */}
      {createPortal(
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              ref={menuRef}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              style={{
                position: "fixed",
                left: menuPosition.left,
                bottom: menuPosition.bottom,
                zIndex: 9999,
              }}
              className="w-56 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2"
            >
              <button
                onClick={() => {
                  toggleTheme();
                  if (setMenuOpen) setMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
              >
                {isDark ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
                {isDark ? "Light Mode" : "Dark Mode"}
              </button>

              <button
                onClick={() => {
                  logout();
                  setMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
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
