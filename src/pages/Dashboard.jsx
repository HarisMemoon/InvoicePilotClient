// src/pages/DashboardHome.jsx
import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import DashboardPageLoader from "../components/DashboardPageLoader";
import {
  FileText,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Zap,
  Shield,
  FileCheck,
  BarChart3,
  ArrowUpRight,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { format, startOfMonth, subMonths } from "date-fns";
import CountUp from "react-countup";

export default function DashboardHome() {
  const navigate = useNavigate();

  // ------------------------------------------------------------------
  // 1. STATE
  // ------------------------------------------------------------------
  const [user, setUser] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showOverdueAlert, setShowOverdueAlert] = useState(true);

  // ------------------------------------------------------------------
  // 2. AUTH
  // ------------------------------------------------------------------
  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw || raw === "undefined" || raw === "null") {
      navigate("/login", { replace: true });
      return;
    }
    try {
      setUser(JSON.parse(raw));
    } catch {
      localStorage.clear();
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  // ------------------------------------------------------------------
  // 3. FETCH INVOICES
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/invoices`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
        const list = data.invoices || [];
        setInvoices(list);
      } catch (e) {
        setError(e.response?.data?.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user]);

  // ------------------------------------------------------------------
  // 4. STATS
  // ------------------------------------------------------------------
  const stats = useMemo(() => {
    const revenue = invoices.reduce((s, i) => s + (i.total_amount || 0), 0);
    const clients = new Set(
      invoices.map((i) => i.clients?.name).filter(Boolean),
    ).size;
    const totalInvoices = invoices.length;

    return [
      {
        label: "Total Revenue",
        value: revenue,
        icon: DollarSign,
        color: "from-blue-600 to-indigo-600",
        isMoney: true,
      },
      {
        label: "Clients",
        value: clients,
        icon: Users,
        color: "from-violet-500 to-purple-500",
      },
      {
        label: "Invoices",
        value: totalInvoices,
        icon: FileText,
        color: "from-emerald-500 to-teal-500",
      },
    ];
  }, [invoices]);
  // ------------------------------------------------------------------
  // 5. OVERDUE ALERT
  // ------------------------------------------------------------------
  const overdueCount = useMemo(() => {
    return invoices.filter(
      (i) => i.status !== "paid" && new Date(i.due_date) < new Date(),
    ).length;
  }, [invoices]);

  // ------------------------------------------------------------------
  // 6. CHART DATA
  // ------------------------------------------------------------------
  const revenueData = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, i) => {
      const date = startOfMonth(subMonths(new Date(), 5 - i));
      return { name: format(date, "MMM"), revenue: 0 };
    });

    invoices.forEach((inv) => {
      const month = format(new Date(inv.issue_date), "MMM");
      const entry = months.find((m) => m.name === month);
      if (entry) entry.revenue += inv.total_amount || 0;
    });

    return months.map((m) => ({ ...m, revenue: Math.round(m.revenue) }));
  }, [invoices]);

  const statusData = useMemo(() => {
    const paid = invoices.filter((i) => i.status === "paid").length;
    const draft = invoices.filter((i) => i.status === "draft").length;
    const overdue = invoices.filter(
      (i) => i.status !== "paid" && new Date(i.due_date) < new Date(),
    ).length;

    return [
      { name: "Paid", value: paid, color: "#10b981" },
      { name: "Draft", value: draft, color: "#f59e0b" },
      { name: "Overdue", value: overdue, color: "#ef4444" },
    ].filter((d) => d.value > 0);
  }, [invoices]);

  const recentInvoices = useMemo(() => {
    return invoices
      .slice()
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);
  }, [invoices]);

  const formatDate = (d) => format(new Date(d), "MMM d, yyyy");

  // ------------------------------------------------------------------
  // 7. UI
  // ------------------------------------------------------------------
  if (loading) {
    return <DashboardPageLoader message="Loading your dashboard..." />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen  p-6 text-center">
        <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Oops! Something went wrong
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-md">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen  font-inter p-4 sm:p-6 lg:p-8 pt-24 lg:pt-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* HEADER */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4"
        >
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Welcome back,{" "}
              <span className="text-black dark:text-white">
                {user?.full_name?.charAt(0)?.toUpperCase() +
                  user?.full_name?.slice(1) ||
                  user?.email?.split("@")[0].charAt(0).toUpperCase() +
                    user?.email?.split("@")[0].slice(1)}
              </span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              Here’s what’s happening with your business today.
            </p>
          </div>
          <Link
            to="/dashboard/invoices"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-4 focus:ring-blue-500/20 shrink-0"
          >
            <FileText className="w-5 h-5" />
            Create Invoice
          </Link>
        </motion.header>

        {/* OVERDUE ALERT */}
        <AnimatePresence>
          {overdueCount > 0 && showOverdueAlert && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 32 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="overflow-hidden"
            >
              <div className="relative bg-gradient-to-r from-red-500 to-pink-600 text-white p-5 rounded-2xl shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white/20 rounded-full shrink-0">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">
                      {overdueCount} Overdue Invoice
                      {overdueCount > 1 ? "s" : ""}
                    </h3>
                    <p className="text-red-100 text-sm">
                      Action required to avoid late fees and maintain cash flow.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <Link
                    to="/dashboard/invoices"
                    className="flex-1 sm:flex-none justify-center bg-white text-red-600 hover:bg-gray-50 px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors"
                  >
                    Review <ArrowUpRight className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => setShowOverdueAlert(false)}
                    className="p-2.5 rounded-xl hover:bg-white/20 transition-colors"
                    aria-label="Dismiss alert"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* STATS GRID (Restored & Redesigned) */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 dark:border-gray-700 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-default overflow-hidden"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${s.color} opacity-10 dark:opacity-20 group-hover:opacity-20 dark:group-hover:opacity-30 transition-opacity`}
              />
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {s.label}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {s.isMoney
                      ? `$${s.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      : s.value}
                  </p>
                </div>
                <div
                  className={`p-3 rounded-xl bg-gradient-to-br ${s.color} text-white shadow-md`}
                >
                  <s.icon className="w-6 h-6" />
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity" />
            </motion.div>
          ))}
        </section>

        {/* CHARTS ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Trend */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Revenue Overview
              </h3>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={revenueData}
                  margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e5e7eb"
                    strokeOpacity={0.5}
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                      fontWeight: "500",
                      color: "#111827",
                    }}
                    itemStyle={{ color: "#3b82f6" }}
                    formatter={(v) => [`$${v.toLocaleString()}`, "Revenue"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="url(#colorRevenue)"
                    strokeWidth={4}
                    dot={{
                      fill: "#fff",
                      stroke: "#3b82f6",
                      strokeWidth: 2,
                      r: 4,
                    }}
                    activeDot={{ r: 6, fill: "#3b82f6", stroke: "#fff" }}
                  />
                  <defs>
                    <linearGradient
                      id="colorRevenue"
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="0"
                    >
                      <stop offset="0%" stopColor="#2563eb" />
                      <stop offset="100%" stopColor="#9333ea" />
                    </linearGradient>
                  </defs>
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Status Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700 flex flex-col"
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2 shrink-0">
              <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              Invoice Status
            </h3>
            <div className="flex-1 min-h-[250px] relative">
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {statusData.map((entry, i) => (
                        <Cell key={`cell-${i}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                      formatter={(value) => (
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">
                          {value}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                  No data available
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* RECENT INVOICES & FEATURES */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Invoices Table */}
          <section className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Recent Invoices
              </h2>
              <Link
                to="/dashboard/invoices"
                className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1 group transition-colors"
              >
                View All{" "}
                <ArrowUpRight className="w-4 h-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="/50 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-6 py-4">Invoice</th>
                    <th className="px-6 py-4">Client</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {recentInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                          <FileText className="w-10 h-10 mb-3 opacity-20" />
                          <p>No invoices created yet.</p>
                          <Link
                            to="/dashboard/invoices/new"
                            className="text-blue-600 mt-2 font-medium hover:underline"
                          >
                            Create your first invoice
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    recentInvoices.map((inv) => {
                      const isOverdue =
                        inv.status !== "paid" &&
                        new Date(inv.due_date) < new Date();
                      return (
                        <motion.tr
                          key={inv.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          onClick={() =>
                            navigate(`/dashboard/invoices/${inv.id}`)
                          }
                          className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors group"
                        >
                          <td className="px-6 py-4 font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {inv.invoice_number}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-700 dark:text-blue-300 flex items-center justify-center text-xs font-bold border border-blue-200 dark:border-blue-800">
                                {inv.clients?.name?.charAt(0).toUpperCase() ||
                                  "?"}
                              </div>
                              <span className="font-medium text-gray-700 dark:text-gray-300">
                                {inv.clients?.name || "Unknown"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                            ${inv.total_amount?.toFixed(2) || "0.00"}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                                inv.status === "paid"
                                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                  : isOverdue
                                    ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                    : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                              }`}
                            >
                              {inv.status === "paid" ? (
                                <CheckCircle className="w-3.5 h-3.5" />
                              ) : isOverdue ? (
                                <AlertCircle className="w-3.5 h-3.5" />
                              ) : (
                                <Clock className="w-3.5 h-3.5" />
                              )}
                              {isOverdue
                                ? "Overdue"
                                : inv.status.charAt(0).toUpperCase() +
                                  inv.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-sm">
                            {formatDate(inv.issue_date)}
                          </td>
                        </motion.tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Features Side Panel */}
          <section className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden flex flex-col justify-center">
            {/* Decorative background vectors */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-black opacity-10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4" />

            <div className="relative z-10 space-y-6">
              <h2 className="text-2xl font-bold mb-2">
                Power up your workflow
              </h2>

              {[
                {
                  icon: Zap,
                  title: "Lightning Fast",
                  desc: "Create & send in seconds.",
                },
                {
                  icon: Shield,
                  title: "Secure Payments",
                  desc: "Enterprise-grade encryption.",
                },
                {
                  icon: FileCheck,
                  title: "Auto Reminders",
                  desc: "Get paid without asking.",
                },
              ].map((f, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-colors"
                >
                  <div className="p-2 bg-white/20 rounded-lg shrink-0">
                    <f.icon className="w-6 h-6 text-blue-100" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{f.title}</h3>
                    <p className="text-blue-100 text-sm mt-1 leading-relaxed">
                      {f.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
