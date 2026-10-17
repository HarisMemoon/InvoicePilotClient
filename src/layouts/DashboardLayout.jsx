// src/layouts/DashboardLayout.jsx
import { Outlet } from "react-router-dom";
import Sidebar from "../components/SideBar";
import { useState, useEffect } from "react";

export default function DashboardLayout() {
  const [sidebarWidth, setSidebarWidth] = useState(260);

  useEffect(() => {
    const updateWidth = () => {
      const sidebar = document.querySelector("aside");
      if (sidebar) {
        setSidebarWidth(sidebar.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-indigo-900/30 dark:to-purple-900/30">
      <Sidebar />

      <main
        className="flex-1 transition-all duration-300 overflow-y-auto"
        style={{ marginLeft: sidebarWidth }}
      >
        <div className="p-4 sm:p-6 md:p-8 lg:p-10">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
