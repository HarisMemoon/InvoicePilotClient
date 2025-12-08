// src/components/Navbar.jsx
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* LOGO */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl blur-md opacity-70 group-hover:opacity-100 transition" />
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                IP
              </div>
            </div>
            <div className="hidden sm:block">
              <div className="text-lg font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                InvoicePilot
              </div>
              <div className="text-xs text-gray-500">Smart Invoicing</div>
            </div>
          </Link>

          {/* PUBLIC CTA */}
          <div className="flex gap-2">
            <Link
              to="/login"
              className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
