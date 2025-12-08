import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Loader2,
} from "lucide-react";
import Navbar from "../components/Navbar";
import axios from "axios";

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // === 1. Safe User Load ===
  useEffect(() => {
    const rawUser = localStorage.getItem("user");
    if (!rawUser || rawUser === "undefined" || rawUser === "null") {
      navigate("/login", { replace: true });
      return;
    }
    try {
      const parsed = JSON.parse(rawUser);
      setUser(parsed);
    } catch (err) {
      console.error("Corrupted user data:", err);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  // === 2. Fetch Invoices & Compute Stats ===
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await axios.get("http://localhost:5000/api/invoices", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const invoicesData = res.data.invoices || [];

        // Compute Stats
        const total = invoicesData.length;
        const paid = invoicesData.filter((i) => i.status === "paid").length;
        const draft = invoicesData.filter((i) => i.status === "draft").length;
        const clients = new Set(invoicesData.map((i) => i.client_id)).size;

        setStats([
          {
            label: "Total Invoices",
            value: total,
            icon: FileText,
            color: "from-blue-500 to-cyan-500",
          },
          {
            label: "Pending/Draft",
            value: draft,
            icon: Clock,
            color: "from-amber-500 to-orange-500",
          },
          {
            label: "Paid Invoices",
            value: paid,
            icon: CheckCircle,
            color: "from-emerald-500 to-teal-500",
          },
          {
            label: "Clients",
            value: clients,
            icon: Users,
            color: "from-violet-500 to-purple-500",
          },
        ]);

        // Sort by created_at (newest first), take latest 5
        const recent = invoicesData
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 5);

        setInvoices(recent);
      } catch (err) {
        console.error("Failed to fetch invoices:", err);
        setError(err.response?.data?.message || "Failed to load invoices");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchInvoices();
    }
  }, [user]);

  // === 3. Status Badge ===
  const getStatusBadge = (status) => {
    const isPaid = status === "paid";
    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
          isPaid
            ? "bg-emerald-100 text-emerald-700"
            : "bg-amber-100 text-amber-700"
        }`}
      >
        {isPaid ? (
          <CheckCircle className="w-3 h-3" />
        ) : (
          <Clock className="w-3 h-3" />
        )}
        {isPaid ? "Paid" : "Draft"}
      </span>
    );
  };

  // === 4. Format Date ===
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };
  console.log("user:", user);
  // === 5. Loading State ===
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Navbar />
        <div className="max-w-7xl mx-auto p-6 pt-24 space-y-8">
          <div className="h-10 bg-gray-200 rounded w-64 animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg animate-pulse"
              >
                <div className="h-5 bg-gray-200 rounded w-24 mb-2" />
                <div className="h-9 bg-gray-300 rounded w-16" />
              </div>
            ))}
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6">
            <div className="h-6 bg-gray-200 rounded w-48 mb-4" />
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-12 bg-gray-100 rounded animate-pulse"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // === 6. Error State ===
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">
            Failed to Load Data
          </h3>
          <p className="text-gray-600 mt-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6 pt-24 space-y-8">
        {/* Header */}
        <header className="space-y-2">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-2">
            Welcome back,{" "}
            {user?.user_metadata?.name || user?.email?.split("@")[0] || "User"}!
            <span className="text-3xl animate-wave">Wave</span>
          </h1>
          <p className="text-gray-600">
            Here’s what’s happening with your invoices today.
          </p>
        </header>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 
                         hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-default overflow-hidden"
              style={{
                animation: "fade-up 0.6s ease-out both",
                animationDelay: `${idx * 100}ms`,
              }}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-10 group-hover:opacity-20 transition-opacity`}
              />
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-md`}
                >
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity" />
            </div>
          ))}
        </section>

        {/* Recent Invoices */}
        <section className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 overflow-hidden">
          <div className="p-6 border-b border-gray-200/70">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Recent Invoices
              </h2>
              <button
                onClick={() => navigate("/invoices")}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:gap-2 transition-all"
              >
                View All
                <TrendingUp className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600 font-medium bg-gray-50/70">
                  <th className="px-6 py-4">Invoice ID</th>
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoices.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No invoices yet. Create your first one!
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => (
                    <tr
                      key={inv.id}
                      className="hover:bg-blue-50/50 transition-colors duration-200 cursor-pointer"
                      onClick={() => navigate(`/invoice/${inv.id}`)}
                    >
                      <td className="px-6 py-4 font-medium text-blue-700">
                        {inv.invoice_number}
                      </td>
                      <td className="px-6 py-4 text-gray-800">
                        {inv.clients?.name || "Unknown"}
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        ${inv.total_amount}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(inv.status)}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {formatDate(inv.issue_date)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 text-center text-sm text-gray-500 border-t border-gray-100">
            Showing {invoices.length} of {invoices.length} recent invoices
          </div>
        </section>
      </div>
    </div>
  );
}
