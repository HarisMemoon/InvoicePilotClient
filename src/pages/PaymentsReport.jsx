// src/pages/PaymentsReport.jsx
import { useEffect, useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import {
  format,
  startOfMonth,
  subMonths,
  startOfDay,
  endOfDay,
} from "date-fns";
import {
  DollarSign,
  TrendingUp,
  Download,
  Search,
  Filter,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  CalendarDays,
  ChevronDown,
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
import { formatInTimeZone } from "date-fns-tz";
import { PDFDownloadLink } from "@react-pdf/renderer";
import PaymentsPDF from "../components/PaymentsPDF";

const DATE_RANGES = [
  { label: "Last 30 days", value: 30 },
  { label: "Last 90 days", value: 90 },
  { label: "Last 6 months", value: 180 },
  { label: "All time", value: null },
];

const COLORS = {
  succeeded: "#10b981",
  pending: "#f59e0b",
  failed: "#ef4444",
};

export default function PaymentsReport() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState(30);
  const [user, setUser] = useState(null);
  const [showDateMenu, setShowDateMenu] = useState(false);

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
        const { data } = await axios.get("http://localhost:5000/api/payments", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
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

      const matchesSearch =
        p.invoice_number
          ?.toLowerCase()
          .includes(debouncedSearch.toLowerCase()) ||
        p.client_name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        p.user_email?.toLowerCase().includes(debouncedSearch.toLowerCase());

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
    return filtered
      .reduce(
        (sum, p) => sum + (p.status === "succeeded" ? Number(p.amount) : 0),
        0
      )
      .toFixed(2);
  }, [filtered]);

  const exportCSV = () => {
    const headers = ["Date", "Invoice", "Client", "Email", "Amount", "Status"];
    const rows = filtered.map((p) => [
      format(new Date(p.paid_at), "MMM d, yyyy"),
      p.invoice_number || "—",
      p.client_name || "—",
      p.user_email || "—",
      `$${p.amount?.toFixed(2) || "0.00"}`,
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
    return (
      <div className="flex items-center justify-center min-h-96">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6"
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent flex items-center gap-3">
            <DollarSign className="w-10 h-10" />
            Payments Report
          </h1>
          <p className="text-gray-600 mt-2">
            Real-time revenue analytics & payment tracking
          </p>
        </div>

        <div className="flex gap-3">
          <PDFDownloadLink
            document={<PaymentsPDF data={filtered} total={totalRevenue} />}
            fileName={`payments-${format(new Date(), "yyyy-MM-dd")}.pdf`}
          >
            {({ loading }) => (
              <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all">
                <Download className="w-4 h-4" />
                {loading ? "Preparing..." : "PDF"}
              </button>
            )}
          </PDFDownloadLink>

          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:shadow-lg transition-all"
          >
            <Download className="w-4 h-4" />
            CSV
          </button>
        </div>
      </motion.header>

      {/* SUMMARY CARD */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 text-white rounded-3xl p-8 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-emerald-100 text-lg">Total Revenue</p>
            <p className="text-5xl font-bold mt-2">${totalRevenue}</p>
            <p className="text-emerald-200 mt-1">
              {filtered.length} payments •{" "}
              {statusData.find((s) => s.name === "Paid")?.value || 0} paid
            </p>
          </div>
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <TrendingUp className="w-16 h-16 text-emerald-200" />
          </motion.div>
        </div>
      </motion.div>

      {/* FILTERS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search invoice, client, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all"
        >
          <option value="all">All Status</option>
          <option value="succeeded">Paid</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>

        <div className="relative">
          <button
            onClick={() => setShowDateMenu(!showDateMenu)}
            className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all"
          >
            <span className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5" />
              {DATE_RANGES.find((r) => r.value === dateRange)?.label ||
                "Custom"}
            </span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                showDateMenu ? "rotate-180" : ""
              }`}
            />
          </button>

          {showDateMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
            >
              {DATE_RANGES.map((range) => (
                <button
                  key={range.value}
                  onClick={() => {
                    setDateRange(range.value);
                    setShowDateMenu(false);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-emerald-50 dark:hover:bg-emerald-900/50 transition-all"
                >
                  {range.label}
                </button>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-xl p-6 border border-white/20 dark:border-gray-700"
        >
          <h3 className="text-xl font-bold mb-6 flex items-center justify-between">
            Revenue Trend
            <Calendar className="w-6 h-6 text-emerald-600" />
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart
              data={revenueData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="4 4" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fill: "#6b7280" }} />
              <YAxis tick={{ fill: "#6b7280" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                }}
                formatter={(v) => `$${v}`}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#10b981"
                strokeWidth={4}
                dot={{ fill: "#10b981", r: 6 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-xl p-6 border border-white/20 dark:border-gray-700"
        >
          <h3 className="text-xl font-bold mb-6">Payment Status</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {statusData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                }}
              />
              <Legend
                iconType="circle"
                formatter={(value) => (
                  <span className="font-medium">{value}</span>
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
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-xl overflow-hidden border border-white/20 dark:border-gray-700"
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-2xl font-bold flex items-center gap-3">
            <FileText className="w-7 h-7 text-emerald-600" />
            Payment History
          </h3>
        </div>

        {filtered.length === 0 ? (
          <div className="p-16 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mx-auto w-32 h-32 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mb-6"
            >
              <DollarSign className="w-16 h-16 text-emerald-600" />
            </motion.div>
            <h4 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
              No payments found
            </h4>
            <p className="text-gray-500 mt-2">
              Try adjusting your filters or date range.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
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
                      className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filtered.map((p, i) => {
                  const Icon =
                    p.status === "succeeded"
                      ? CheckCircle
                      : p.status === "pending"
                      ? Clock
                      : XCircle;
                  const color =
                    p.status === "succeeded"
                      ? "emerald"
                      : p.status === "pending"
                      ? "amber"
                      : "red";
                  return (
                    <motion.tr
                      key={p.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 transition-all"
                    >
                      <td className="px-6 py-4 text-sm">
                        {format(new Date(p.paid_at), "MMM d, yyyy")}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          to={`/dashboard/invoices/${p.invoice_id}`}
                          className="text-emerald-600 hover:underline font-medium"
                        >
                          {p.invoice_number || "—"}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {p.client_name || "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {p.user_email || "—"}
                      </td>
                      <td className="px-6 py-4 font-medium">
                        ${p.amount?.toFixed(2) || "0.00"}
                      </td>
                      <td className="px-6 py-4">
                        <motion.span
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-${color}-100 text-${color}-700 dark:bg-${color}-900/30 dark:text-${color}-300`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          {p.status}
                        </motion.span>
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
