// src/pages/DashboardHome.jsx
import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
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
  Loader2,
  ArrowUpRight,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
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
  const [showOverdueAlert, setShowOverdueAlert] = useState(true); // NEW

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
        const { data } = await axios.get("http://localhost:5000/api/invoices", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
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
    const total = invoices.length;
    const paid = invoices.filter((i) => i.status === "paid").length;
    const draft = invoices.filter((i) => i.status === "draft").length;
    const uniqueClients = new Set(
      invoices.map((i) => i.clients?.name).filter(Boolean)
    ).size;
    const revenue = invoices.reduce((s, i) => s + (i.total_amount || 0), 0);

    return [
      {
        label: "Total Invoices",
        value: total,
        icon: FileText,
        color: "from-blue-500 to-cyan-500",
      },
      {
        label: "Paid",
        value: paid,
        icon: CheckCircle,
        color: "from-emerald-500 to-teal-500",
      },
      {
        label: "Draft",
        value: draft,
        icon: Clock,
        color: "from-amber-500 to-orange-500",
      },
      {
        label: "Clients",
        value: uniqueClients,
        icon: Users,
        color: "from-violet-500 to-purple-500",
      },
      {
        label: "Revenue",
        value: revenue,
        icon: DollarSign,
        color: "from-indigo-500 to-purple-500",
        isMoney: true,
      },
    ];
  }, [invoices]);

  // ------------------------------------------------------------------
  // 5. OVERDUE ALERT
  // ------------------------------------------------------------------
  const overdueCount = useMemo(() => {
    return invoices.filter(
      (i) => i.status !== "paid" && new Date(i.due_date) < new Date()
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
      (i) => i.status !== "paid" && new Date(i.due_date) < new Date()
    ).length;

    return [
      { name: "Paid", value: paid, color: "#10b981" },
      { name: "Draft", value: draft, color: "#f59e0b" },
      { name: "Overdue", value: overdue, color: "#ef4444" },
    ].filter((d) => d.value > 0);
  }, [invoices]);

  const recentInvoices = useMemo(() => {
    return invoices
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);
  }, [invoices]);

  const formatDate = (d) => format(new Date(d), "MMM d, yyyy");

  // ------------------------------------------------------------------
  // 7. UI
  // ------------------------------------------------------------------
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600 dark:text-blue-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="h-full space-y-8">
      <div className="max-w-7xl mx-auto p-6 pt-24 space-y-8">
        {/* OVERDUE ALERT — WITH CLOSE BUTTON */}
        {overdueCount > 0 && showOverdueAlert && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative bg-gradient-to-r from-red-600 to-pink-600 text-white p-5 rounded-2xl shadow-xl flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6" />
              <div>
                <p className="font-bold">
                  {overdueCount} Overdue Invoice{overdueCount > 1 ? "s" : ""}
                </p>
                <p className="text-sm opacity-90">Act now to avoid late fees</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/dashboard/invoices"
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1"
              >
                View <ArrowUpRight className="w-4 h-4" />
              </Link>
              <button
                onClick={() => setShowOverdueAlert(false)}
                className="p-1 rounded-full hover:bg-white/20 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}

        {/* HEADER */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            Welcome back,
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              {user?.user_metadata?.name || user?.email?.split("@")[0]}!
            </span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Here’s what’s happening with your business today.
          </p>
        </motion.header>

        {/* FEATURES — MOVED ABOVE CHARTS */}
        <section className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/30 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            What{" "}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              InvoicePilot
            </span>{" "}
            Can Do for You
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Zap,
                title: "Lightning Fast",
                desc: "Create invoices in seconds",
              },
              {
                icon: Shield,
                title: "Secure Payments",
                desc: "Stripe with end-to-end encryption",
              },
              {
                icon: FileCheck,
                title: "Auto Reminders",
                desc: "Never miss a payment",
              },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-indigo-900/30 rounded-xl p-6 text-center shadow-md hover:shadow-xl transition-all"
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white">
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {f.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* STATS GRID */}
        {/* <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="group relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/30 dark:border-gray-700 
                         hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-default overflow-hidden"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${s.color} opacity-15 dark:opacity-25 group-hover:opacity-25 dark:group-hover:opacity-35 transition-opacity`}
              />
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {s.label}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {s.isMoney ? (
                      <CountUp
                        start={0}
                        end={s.value}
                        duration={2.5}
                        prefix="$"
                        decimals={0}
                        formattingFn={(v) => `$${v.toLocaleString()}`}
                      />
                    ) : (
                      <CountUp start={0} end={s.value} duration={2.5} />
                    )}
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
        </section> */}

        {/* CHARTS ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Trend */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/30 dark:border-gray-700"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Revenue Trend
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={revenueData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb dark:stroke-gray-700"
                />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#6b7280 dark:fill-gray-400" }}
                />
                <YAxis tick={{ fill: "#6b7280 dark:fill-gray-400" }} />
                <Tooltip
                  contentStyle={{
                    background: "#fff dark:bg-gray-800",
                    border: "1px solid #e5e7eb dark:border-gray-700",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                  formatter={(v) => `$${v}`}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: "#3b82f6", r: 6 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Status Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/30 dark:border-gray-700"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              Invoice Status
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => (
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* RECENT INVOICES */}
        <section className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200/70 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Recent Invoices
            </h2>
            <Link
              to="/dashboard/invoices"
              className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 hover:gap-2 transition-all"
            >
              View All <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50/70 dark:bg-gray-700/50">
                <tr className="text-left text-gray-600 dark:text-gray-300 font-medium">
                  <th className="px-6 py-4">Invoice #</th>
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {recentInvoices.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                    >
                      No invoices yet. Create your first one!
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
                        className="hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer"
                        onClick={() =>
                          navigate(`/dashboard/invoices/${inv.id}`)
                        }
                      >
                        <td className="px-6 py-4 font-medium text-blue-700 dark:text-blue-400">
                          {inv.invoice_number}
                        </td>
                        <td className="px-6 py-4 text-gray-800 dark:text-gray-200">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                              {inv.clients?.name?.charAt(0).toUpperCase() ||
                                "?"}
                            </div>
                            {inv.clients?.name || "—"}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                          ${inv.total_amount?.toFixed(2) || "0.00"}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              inv.status === "paid"
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                : isOverdue
                                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                            }`}
                          >
                            {inv.status === "paid" ? (
                              <CheckCircle className="w-3 h-3" />
                            ) : isOverdue ? (
                              <AlertCircle className="w-3 h-3" />
                            ) : (
                              <Clock className="w-3 h-3" />
                            )}
                            {isOverdue
                              ? "Overdue"
                              : inv.status.charAt(0).toUpperCase() +
                                inv.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
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
      </div>
    </div>
  );
}
