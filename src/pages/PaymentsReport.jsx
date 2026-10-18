// src/pages/PaymentsReport.jsx
import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api";
import { format, startOfMonth, subMonths } from "date-fns";
import {
  DollarSign,
  TrendingUp,
  Download,
  Search,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  CalendarDays,
  Filter,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { toast } from "react-hot-toast";
import { useDebounce } from "react-use";
import { PDFDownloadLink } from "@react-pdf/renderer";
import PaymentsPDF from "../components/PaymentsPDF";
import FilterSelect from "../components/FilterSelect"; // <-- Imported new component
import DashboardPageLoader from "../components/DashboardPageLoader";

const DATE_RANGES = [
  { label: "Last 30 days", value: 30 },
  { label: "Last 90 days", value: 90 },
  { label: "Last 6 months", value: 180 },
  { label: "All time", value: null },
];

const STATUS_OPTIONS = [
  { label: "All Status", value: "all" },
  { label: "Paid", value: "succeeded" },
  { label: "Pending", value: "pending" },
  { label: "Failed", value: "failed" },
];

const COLORS = {
  succeeded: "#10b981",
  pending: "#f59e0b",
  failed: "#ef4444",
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount || 0);

export default function PaymentsReport() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState(30);
  const [user, setUser] = useState(null);

  const navigate = useNavigate();

  useDebounce(() => setDebouncedSearch(search), 300, [search]);

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

  useEffect(() => {
    const fetchPayments = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const { data } = await api.get(
          `/api/payments`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
        setPayments(data.payments || []);
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load payments");
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, [user]);

  // ── FILTERS ─────────────────────────────────────
  const filtered = useMemo(() => {
    return payments.filter((p) => {
      const now = new Date();
      const paidAt = new Date(p.paid_at);
      const daysAgo = dateRange
        ? (now - paidAt) / (1000 * 60 * 60 * 24)
        : Infinity;

      const searchLower = debouncedSearch.toLowerCase();
      const matchesSearch =
        p.invoice_number?.toLowerCase().includes(searchLower) ||
        p.client_name?.toLowerCase().includes(searchLower) ||
        p.user_email?.toLowerCase().includes(searchLower);

      const matchesStatus = statusFilter === "all" || p.status === statusFilter;
      const matchesDate = daysAgo <= (dateRange || Infinity);

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [payments, debouncedSearch, statusFilter, dateRange]);

  // ── CHARTS ──────────────────────────────────────
  const revenueData = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, i) => {
      const date = startOfMonth(subMonths(new Date(), 5 - i));
      return { name: format(date, "MMM"), revenue: 0 };
    });

    filtered.forEach((p) => {
      if (p.status === "succeeded") {
        const month = format(new Date(p.paid_at), "MMM");
        const entry = months.find((m) => m.name === month);
        if (entry) entry.revenue += Number(p.amount) || 0;
      }
    });

    return months.map((m) => ({ ...m, revenue: Math.round(m.revenue) }));
  }, [filtered]);

  const statusData = useMemo(() => {
    const map = { succeeded: 0, pending: 0, failed: 0 };
    filtered.forEach((p) => map[p.status]++);
    return [
      { name: "Paid", value: map.succeeded, color: COLORS.succeeded },
      { name: "Pending", value: map.pending, color: COLORS.pending },
      { name: "Failed", value: map.failed, color: COLORS.failed },
    ].filter((d) => d.value > 0);
  }, [filtered]);

  const totalRevenue = useMemo(() => {
    return filtered.reduce(
      (sum, p) => sum + (p.status === "succeeded" ? Number(p.amount) : 0),
      0,
    );
  }, [filtered]);

  const exportCSV = () => {
    const headers = ["Date", "Invoice", "Client", "Email", "Amount", "Status"];
    const rows = filtered.map((p) => [
      format(new Date(p.paid_at), "MMM d, yyyy"),
      p.invoice_number || "—",
      p.client_name || "—",
      p.user_email || "—",
      `${p.amount?.toFixed(2) || "0.00"}`,
      p.status,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payments-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    toast.success("CSV exported!");
  };

  // ── UI ──────────────────────────────────────────
  if (loading) {
    return <DashboardPageLoader message="Loading payment report..." />;
  }

  return (
    <div className="space-y-8 pb-10">
      {/* HEADER */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6"
      >
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent flex items-center gap-3">
            <DollarSign className="w-10 h-10 text-emerald-600" />
            Payments Report
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 font-medium">
            Real-time revenue analytics & payment tracking
          </p>
        </div>

        <div className="flex gap-3">
          {/* <PDFDownloadLink
            document={<PaymentsPDF data={filtered} total={totalRevenue} />}
            fileName={`payments-${format(new Date(), "yyyy-MM-dd")}.pdf`}
          >
            {({ loading }) => (
              <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all">
                <Download className="w-4 h-4" />
                {loading ? "Preparing..." : "Export PDF"}
              </button>
            )}
          </PDFDownloadLink> */}

          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </motion.header>

      {/* SUMMARY CARD */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.01 }}
        className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden transition-all duration-300"
      >
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-emerald-100 text-lg font-medium">
              Total Revenue
            </p>
            <p className="text-5xl md:text-6xl font-bold mt-2 tracking-tight">
              {formatCurrency(totalRevenue)}
            </p>
            <p className="text-emerald-100 mt-3 flex items-center gap-2 font-medium">
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                {filtered.length} total payments
              </span>
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                {statusData.find((s) => s.name === "Paid")?.value || 0}{" "}
                successful
              </span>
            </p>
          </div>
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="hidden md:block"
          >
            <TrendingUp className="w-20 h-20 text-emerald-100/80 drop-shadow-lg" />
          </motion.div>
        </div>
      </motion.div>

      {/* FILTERS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors z-10" />
          <input
            type="text"
            placeholder="Search invoice, client, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all shadow-sm"
          />
        </div>

        {/* Reusable FilterSelect Component */}
        <FilterSelect
          value={statusFilter}
          onChange={setStatusFilter}
          options={STATUS_OPTIONS}
          icon={Filter}
        />

        <FilterSelect
          value={dateRange}
          onChange={setDateRange}
          options={DATE_RANGES.map((range) => ({
            label: range.label,
            value: range.value,
          }))}
          placeholder="Date range"
          icon={CalendarDays}
        />
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
        >
          <h3 className="text-xl font-bold mb-6 flex items-center justify-between text-gray-800 dark:text-white">
            Revenue Trend
            <Calendar className="w-6 h-6 text-emerald-500" />
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart
              data={revenueData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="4 4"
                stroke="#e5e7eb"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                tick={{ fill: "#6b7280", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#6b7280", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.98)",
                  border: "1px solid #f3f4f6",
                  borderRadius: "16px",
                  boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
                  padding: "12px",
                }}
                formatter={(v) => [formatCurrency(v), "Revenue"]}
                labelStyle={{
                  color: "#374151",
                  fontWeight: "bold",
                  marginBottom: "4px",
                }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#10b981"
                strokeWidth={4}
                dot={{ fill: "#10b981", r: 4, strokeWidth: 2, stroke: "#fff" }}
                activeDot={{ r: 8, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
        >
          <h3 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">
            Payment Status
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={110}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {statusData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.98)",
                  border: "none",
                  borderRadius: "12px",
                  boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                }}
                itemStyle={{ color: "#374151", fontWeight: 600 }}
              />
              <Legend
                iconType="circle"
                formatter={(value) => (
                  <span className="font-medium text-gray-700 dark:text-gray-300 ml-1">
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* TABLE */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700"
      >
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
          <h3 className="text-2xl font-bold flex items-center gap-3 text-gray-800 dark:text-white">
            <FileText className="w-7 h-7 text-emerald-500" />
            Payment History
          </h3>
        </div>

        {filtered.length === 0 ? (
          <div className="py-20 px-6 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mx-auto w-24 h-24 bg-gray-50 dark:bg-gray-700/50 rounded-full flex items-center justify-center mb-6"
            >
              <Search className="w-10 h-10 text-gray-400" />
            </motion.div>
            <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              No payments found
            </h4>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
              We couldn't find any payments matching your current filters. Try
              adjusting the date range or search terms.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full whitespace-nowrap">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  {[
                    "Date",
                    "Invoice",
                    "Client",
                    "Email",
                    "Amount",
                    "Status",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filtered.map((p, i) => {
                  const isSucceeded = p.status === "succeeded";
                  const isPending = p.status === "pending";
                  const Icon = isSucceeded
                    ? CheckCircle
                    : isPending
                      ? Clock
                      : XCircle;

                  // Tailwind purge-safe class maps
                  const statusStyles = isSucceeded
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    : isPending
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";

                  return (
                    <motion.tr
                      key={p.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="hover:bg-emerald-50/50 dark:hover:bg-gray-700/30 transition-colors group"
                    >
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {format(new Date(p.paid_at), "MMM d, yyyy")}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          to={`/dashboard/invoices/${p.invoice_id}`}
                          className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-semibold transition-colors"
                        >
                          {p.invoice_number || "—"}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                        {p.client_name || "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {p.user_email || "—"}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-gray-100">
                        {formatCurrency(p.amount)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold capitalize ${statusStyles}`}
                        >
                          <Icon className="w-3 h-3" />
                          {p.status}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
