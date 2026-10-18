// src/pages/InvoicesPage.jsx
import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  FileText,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Search,
  User,
  Eye,
  Trash2,
  CreditCard,
  Loader2,
  X,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import FilterSelect from "../components/FilterSelect";

const INVOICE_STATUS_OPTIONS = [
  { label: "All Status", value: "all" },
  { label: "Paid", value: "paid" },
  { label: "Draft", value: "draft" },
  { label: "Pending", value: "pending" },
  { label: "Overdue", value: "overdue" },
];

export default function InvoicesPage() {
  const navigate = useNavigate();

  // 1. STATE
  const [user, setUser] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // 2. AUTH CHECK
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

  // 3. FETCH INVOICES
  useEffect(() => {
    const fetchInvoices = async () => {
      if (!user) return;
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
        const sorted = (data.invoices || []).sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at),
        );
        setInvoices(sorted);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load invoices");
        toast.error("Failed to load invoices");
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, [user]);

  // 4. FILTER & SEARCH
  const filtered = useMemo(() => {
    return invoices
      .filter((i) => {
        const matchesSearch =
          i.invoice_number?.toLowerCase().includes(search.toLowerCase()) ||
          i.clients?.name?.toLowerCase().includes(search.toLowerCase());
        const matchesStatus =
          statusFilter === "all" || i.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => new Date(b.issue_date) - new Date(a.issue_date));
  }, [invoices, search, statusFilter]);

  // 5. STATS
  const stats = useMemo(() => {
    const paid = filtered.filter((i) => i.status === "paid").length;
    const draft = filtered.filter((i) => i.status === "draft").length;
    const overdue = filtered.filter(
      (i) => i.status !== "paid" && new Date(i.due_date) < new Date(),
    ).length;
    const clients = new Set(filtered.map((i) => i.clients?.id).filter(Boolean))
      .size;

    return [
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
        label: "Overdue",
        value: overdue,
        icon: AlertCircle,
        color: "from-red-500 to-pink-500",
      },
      {
        label: "Clients",
        value: clients,
        icon: Users,
        color: "from-violet-500 to-purple-500",
      },
    ];
  }, [filtered]);

  // 6. ACTIONS
  const handleDelete = useCallback(async (id) => {
    if (!window.confirm("Delete this invoice?")) return;
    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/invoices/${id}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      setInvoices((prev) => prev.filter((i) => i.id !== id));
      toast.success("Invoice deleted");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to delete");
    }
  }, []);

  const handlePay = useCallback(async (invoice) => {
    if (!invoice?.id) {
      toast.error("Invalid invoice");
      return;
    }
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/stripe/create-checkout-session`,
        { invoice_id: invoice.id },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast.error("No payment URL returned");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to start payment");
    }
  }, []);

  const handleCreateSuccess = useCallback((newInvoice) => {
    setInvoices((prev) => [newInvoice, ...prev]);
    setShowCreate(false);
    toast.success("Invoice created!");
  }, []);

  // 7. STATUS BADGE
  const StatusBadge = ({ status, isOverdue }) => {
    const map = {
      paid: {
        bg: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
        icon: CheckCircle,
      },
      draft: {
        bg: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
        icon: Clock,
      },
      overdue: {
        bg: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
        icon: AlertCircle,
      },
      pending: {
        bg: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
        icon: Clock,
      },
    };
    const finalStatus = isOverdue ? "overdue" : status;
    const { bg, icon: Icon } = map[finalStatus] || map.draft;
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${bg}`}
      >
        <Icon className="w-3 h-3" />
        {finalStatus.charAt(0).toUpperCase() + finalStatus.slice(1)}
      </span>
    );
  };

  // 8. UI
  if (!user) return null;

  return (
    <div className="h-full space-y-8 pb-12">
      <div className="max-w-7xl mx-auto p-6 pt-24 space-y-8">
        {/* HEADER */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FileText className="w-9 h-9 text-blue-600 dark:text-blue-400" />
              Invoices
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Create, view and manage all invoices.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCreate(true)}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl shadow-lg hover:shadow-xl transition font-medium"
          >
            <Plus className="w-5 h-5" />
            New Invoice
          </motion.button>
        </header>

        {/* ERROR */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* STATS GRID */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${s.color} opacity-5 dark:opacity-10 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity`}
              />
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {s.label}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                    {s.value}
                  </p>
                </div>
                <div
                  className={`p-3 rounded-xl bg-gradient-to-br ${s.color} text-white shadow-md`}
                >
                  <s.icon className="w-6 h-6" />
                </div>
              </div>
            </motion.div>
          ))}
        </section>

        {/* SEARCH + FILTER */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search invoice # or client..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 bg-white/80 dark:bg-gray-800 backdrop-blur-md text-gray-900 dark:text-white transition outline-none"
            />
          </div>
          <FilterSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={INVOICE_STATUS_OPTIONS}
            placeholder="Select Status"
            className="w-full h-full md:w-48"
          />
        </div>

        {/* TABLE */}
        <section className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="p-16 text-center">
              <Loader2 className="w-10 h-10 mx-auto animate-spin text-blue-600 dark:text-blue-400" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-20 h-20 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-10 h-10 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                No invoices found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Try adjusting your search or filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="bg-gray-50/80 dark:bg-gray-700/80 border-b border-gray-100 dark:border-gray-700">
                  <tr className="text-gray-600 dark:text-gray-300 font-semibold">
                    <th className="px-6 py-4">Invoice #</th>
                    <th className="px-6 py-4">Client</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Due Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                  <AnimatePresence>
                    {filtered.map((inv) => {
                      const isOverdue =
                        inv.status !== "paid" &&
                        new Date(inv.due_date) < new Date();
                      return (
                        <motion.tr
                          layout
                          key={inv.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors cursor-pointer group"
                          onClick={() => setSelectedInvoice(inv)}
                        >
                          <td className="px-6 py-4 font-medium text-blue-700 dark:text-blue-400">
                            {inv.invoice_number}
                          </td>
                          <td className="px-6 py-4 text-gray-800 dark:text-gray-200">
                            {inv.clients?.name || "—"}
                          </td>
                          <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                            ${inv.total_amount?.toFixed(2) || "0.00"}
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge
                              status={inv.status}
                              isOverdue={isOverdue}
                            />
                          </td>
                          <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                            {format(new Date(inv.due_date), "MMM d, yyyy")}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedInvoice(inv);
                                }}
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
                                title="View"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(inv.id);
                                }}
                                className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* MODALS */}
      <AnimatePresence>
        {showCreate && (
          <CreateInvoiceForm
            onClose={() => setShowCreate(false)}
            onSuccess={handleCreateSuccess}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedInvoice && (
          <InvoiceViewModal
            invoice={selectedInvoice}
            onClose={() => setSelectedInvoice(null)}
            onPay={handlePay}
            StatusBadge={StatusBadge}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ------------------------------------------------------------------
// CREATE INVOICE FORM
// ------------------------------------------------------------------
function CreateInvoiceForm({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    client_id: "",
    issue_date: new Date().toISOString().split("T")[0],
    due_date: "",
    items: [{ description: "", quantity: 1, unit_price: 0 }],
  });
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/clients`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
        setClients(data.clients || []);
      } catch (err) {
        toast.error("Failed to load clients");
      }
    };
    fetchClients();
  }, []);

  const addItem = () =>
    setForm((f) => ({
      ...f,
      items: [...f.items, { description: "", quantity: 1, unit_price: 0 }],
    }));
  const removeItem = (i) =>
    setForm((f) => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        invoice_items: form.items.map((it) => ({
          description: it.description,
          quantity: Number(it.quantity),
          unit_price: Number(it.unit_price),
        })),
      };

      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/invoices`,
        payload,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      onSuccess(data.invoice);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to create invoice");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 custom-scrollbar"
      >
        <div className="flex justify-between items-center mb-8 border-b border-gray-100 dark:border-gray-700 pb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Create New Invoice
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Client
              </label>
              <select
                required
                value={form.client_id}
                onChange={(e) =>
                  setForm({ ...form, client_id: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700/50 outline-none"
              >
                <option value="">Select client...</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Issue Date
              </label>
              <input
                type="date"
                required
                value={form.issue_date}
                onChange={(e) =>
                  setForm({ ...form, issue_date: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700/50 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Due Date
              </label>
              <input
                type="date"
                required
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700/50 outline-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Line Items
              </h3>
              <button
                type="button"
                onClick={addItem}
                className="text-blue-600 dark:text-blue-400 text-sm font-medium flex items-center gap-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-3 py-1.5 rounded-lg transition"
              >
                <Plus className="w-4 h-4" /> Add Item
              </button>
            </div>

            <div className="space-y-3">
              {form.items.map((item, i) => (
                <div
                  key={i}
                  className="flex flex-wrap sm:flex-nowrap gap-3 items-start bg-gray-50 dark:bg-gray-700/30 p-3 rounded-xl border border-gray-100 dark:border-gray-700"
                >
                  <input
                    placeholder="Item description"
                    required
                    value={item.description}
                    onChange={(e) => {
                      const newItems = [...form.items];
                      newItems[i].description = e.target.value;
                      setForm({ ...form, items: newItems });
                    }}
                    className="flex-1 min-w-[200px] px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800"
                  />
                  <input
                    type="number"
                    placeholder="Qty"
                    min="1"
                    required
                    value={item.quantity}
                    onChange={(e) => {
                      const newItems = [...form.items];
                      newItems[i].quantity = Number(e.target.value);
                      setForm({ ...form, items: newItems });
                    }}
                    className="w-24 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800"
                  />
                  <input
                    type="number"
                    placeholder="Price"
                    step="0.01"
                    required
                    value={item.unit_price}
                    onChange={(e) => {
                      const newItems = [...form.items];
                      newItems[i].unit_price = Number(e.target.value);
                      setForm({ ...form, items: newItems });
                    }}
                    className="w-32 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800"
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(i)}
                    className="p-2.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-6 border-t border-gray-100 dark:border-gray-700 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium flex items-center gap-2 transition disabled:opacity-70 active:scale-95"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Create Invoice
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ------------------------------------------------------------------
// VIEW INVOICE MODAL
// ------------------------------------------------------------------
function InvoiceViewModal({ invoice, onClose, onPay, StatusBadge }) {
  const total =
    invoice.invoice_items
      ?.reduce((s, i) => s + (i.total || i.quantity * i.unit_price), 0)
      .toFixed(2) || "0.00";
  const isOverdue =
    invoice.status !== "paid" && new Date(invoice.due_date) < new Date();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 font-inter">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">
                Invoice Details
              </p>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                #{invoice.invoice_number}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full p-2 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-blue-50 dark:bg-blue-900/10 rounded-xl p-5 mb-8 border border-blue-100 dark:border-blue-800/30 gap-4">
            <div>
              <span className="block text-sm font-semibold text-blue-800 dark:text-blue-300 uppercase tracking-wider mb-2">
                Total Amount
              </span>
              <StatusBadge status={invoice.status} isOverdue={isOverdue} />
            </div>
            <span className="text-3xl font-bold text-gray-900 dark:text-white">
              ${total}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8 p-5 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-100 dark:border-gray-700">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                <User className="w-4 h-4" /> Client
              </div>
              <p className="text-gray-900 dark:text-white font-semibold">
                {invoice.clients?.name || "—"}
              </p>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                <Calendar className="w-4 h-4" /> Issue Date
              </div>
              <p className="text-gray-900 dark:text-white font-semibold">
                {format(new Date(invoice.issue_date), "MMM d, yyyy")}
              </p>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                <Clock className="w-4 h-4" /> Due Date
              </div>
              <p
                className={`font-semibold ${isOverdue ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-white"}`}
              >
                {format(new Date(invoice.due_date), "MMM d, yyyy")}
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">
              Line Items
            </h3>
            <div className="space-y-3">
              {invoice.invoice_items?.map((it, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-4 rounded-xl shadow-sm"
                >
                  <div className="flex flex-col">
                    <span className="text-gray-900 dark:text-white font-medium">
                      {it.description}
                    </span>
                    <span className="text-sm text-gray-500 mt-1">
                      {it.quantity} × ${it.unit_price}
                    </span>
                  </div>
                  <span className="text-gray-900 dark:text-white font-bold text-lg">
                    ${(it.total || it.quantity * it.unit_price).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 shrink-0 flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 rounded-xl font-medium transition active:scale-95"
          >
            Close
          </button>
          {invoice.status !== "paid" && (
            <button
              onClick={() => onPay(invoice)}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white rounded-xl font-medium flex items-center justify-center gap-2 shadow-lg active:scale-95 transition"
            >
              <CreditCard className="w-5 h-5" /> Pay Now
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
