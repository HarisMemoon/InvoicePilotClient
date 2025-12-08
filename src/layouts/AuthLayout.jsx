import React from "react";
import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 overflow-hidden">
      {/* subtle floating blobs (pure CSS, no external assets) */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-1/2 -right-24 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Auth card */}
      <div className="relative z-10 w-full max-w-md p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
