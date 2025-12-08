// src/pages/InvoicesPage.jsx
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  FileText,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Search,
  Filter,
  Eye,
  Trash2,
  CreditCard,
  Loader2,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import StatusBadge from "../components/StatusBadge";
import { format } from "date-fns";

export default function InvoicesPage() {
  const navigate = useNavigate();

  // ------------------------------------------------------------------
  // 1. STATE
  // ------------------------------------------------------------------
  const [user, setUser] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // ------------------------------------------------------------------
  // 2. AUTH CHECK
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
    const fetch = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const { data } = await axios.get("http://localhost:5000/api/invoices", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const sorted = (data.invoices || []).sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setInvoices(sorted);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load invoices");
        toast.error("Failed to load invoices");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user]);

  // ------------------------------------------------------------------
  // 4. FILTER & SEARCH
  // ------------------------------------------------------------------
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

  // ------------------------------------------------------------------
  // 5. STATS
  // ------------------------------------------------------------------
  const stats = useMemo(() => {
    const totalAmt = filtered.reduce((s, i) => s + (i.total_amount || 0), 0);
    const paid = filtered.filter((i) => i.status === "paid").length;
    const draft = filtered.filter((i) => i.status === "draft").length;
    const overdue = filtered.filter(
      (i) => i.status !== "paid" && new Date(i.due_date) < new Date()
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

  // ------------------------------------------------------------------
  // 6. ACTIONS
  // ------------------------------------------------------------------
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this invoice?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/invoices/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setInvoices((prev) => prev.filter((i) => i.id !== id));
      toast.success("Invoice deleted");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to delete");
    }
  };

  // ------------------------------------------------------------------
  // 6. PAY INVOICE (STRIPE)
  // ------------------------------------------------------------------
  const handlePay = async (invoice) => {
    if (!invoice?.id) {
      toast.error("Invalid invoice");
      return;
    }

    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/stripe/create-checkout-session",
        { invoice_id: invoice.id },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast.error("No payment URL returned");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to start payment");
    }
  };

  // ------------------------------------------------------------------
  // 7. CREATE SUCCESS (Updated for nested data)
  // ------------------------------------------------------------------
  const handleCreateSuccess = (newInvoice) => {
    // newInvoice already has clients & invoice_items from controller
    setInvoices((prev) => [newInvoice, ...prev]);
    setShowCreate(false);
    toast.success("Invoice created!");
  };

  // ------------------------------------------------------------------
  // 7. STATUS BADGE
  // ------------------------------------------------------------------
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

  // ------------------------------------------------------------------
  // 8. UI
  // ------------------------------------------------------------------
  if (!user) return null;

  return (
    <div className="h-full space-y-8">
      <div className="max-w-7xl mx-auto p-6 pt-24 space-y-8">
        {/* HEADER */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FileText className="w-9 h-9 text-blue-600 dark:text-blue-400" />
              Invoices
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Create, view and manage all invoices.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl shadow-lg hover:shadow-xl transition"
          >
            <Plus className="w-5 h-5" />
            New Invoice
          </motion.button>
        </header>

        {/* ERROR */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl"
          >
            {error}
          </motion.div>
        )}

        {/* STATS GRID */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 dark:border-gray-700 
                         hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-default overflow-hidden"
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
                    {s.value}
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

        {/* SEARCH + FILTER */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search invoice # or client..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition"
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="draft">Draft</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>

        {/* TABLE */}
        <section className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-10 h-10 mx-auto animate-spin text-blue-600 dark:text-blue-400" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                No invoices match your filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50/70 dark:bg-gray-700/50">
                  <tr className="text-left text-gray-600 dark:text-gray-300 font-medium">
                    <th className="px-6 py-4">Invoice #</th>
                    <th className="px-6 py-4">Client</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Due Date</th>
                    <th className="!text-right px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {filtered.map((inv) => {
                    const isOverdue =
                      inv.status !== "paid" &&
                      new Date(inv.due_date) < new Date();
                    return (
                      <motion.tr
                        key={inv.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer"
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
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                          {format(new Date(inv.due_date), "MMM d, yyyy")}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedInvoice(inv);
                              }}
                              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                              title="View"
                            >
                              <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(inv.id);
                              }}
                              className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* CREATE INVOICE FORM */}
      <AnimatePresence>
        {showCreate && (
          <CreateInvoiceForm
            onClose={() => setShowCreate(false)}
            onSuccess={handleCreateSuccess}
          />
        )}
      </AnimatePresence>

      {/* VIEW MODAL */}
      <AnimatePresence>
        {selectedInvoice && (
          <InvoiceViewModal
            invoice={selectedInvoice}
            onClose={() => setSelectedInvoice(null)}
            onPay={handlePay}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  CREATE INVOICE FORM                                               */
/* ------------------------------------------------------------------ */
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
        const { data } = await axios.get("http://localhost:5000/api/clients", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
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
        client_id: form.client_id,
        issue_date: form.issue_date,
        due_date: form.due_date,
        invoice_items: form.items.map((it) => ({
          description: it.description,
          quantity: Number(it.quantity),
          unit_price: Number(it.unit_price),
        })),
      };

      const { data } = await axios.post(
        "http://localhost:5000/api/invoices",
        payload,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      // data.invoice is full object with clients & invoice_items
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
      className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-screen overflow-y-auto p-6"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Create New Invoice
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Client
              </label>
              <select
                required
                value={form.client_id}
                onChange={(e) =>
                  setForm({ ...form, client_id: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select client</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Issue Date
              </label>
              <input
                type="date"
                required
                value={form.issue_date}
                onChange={(e) =>
                  setForm({ ...form, issue_date: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Due Date
              </label>
              <input
                type="date"
                required
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Line Items
              </label>
              <button
                type="button"
                onClick={addItem}
                className="text-blue-600 dark:text-blue-400 text-sm flex items-center gap-1 hover:underline"
              >
                <Plus className="w-4 h-4" /> Add Item
              </button>
            </div>
            {form.items.map((item, i) => (
              <div key={i} className="flex gap-2 mb-2 items-center">
                <input
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) => {
                    const newItems = [...form.items];
                    newItems[i].description = e.target.value;
                    setForm({ ...form, items: newItems });
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
                <input
                  type="number"
                  placeholder="Qty"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => {
                    const newItems = [...form.items];
                    newItems[i].quantity = Number(e.target.value);
                    setForm({ ...form, items: newItems });
                  }}
                  className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
                <input
                  type="number"
                  placeholder="Price"
                  step="0.01"
                  value={item.unit_price}
                  onChange={(e) => {
                    const newItems = [...form.items];
                    newItems[i].unit_price = Number(e.target.value);
                    setForm({ ...form, items: newItems });
                  }}
                  className="w-28 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => removeItem(i)}
                  className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg hover:shadow-lg flex items-center gap-2 disabled:opacity-70"
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

/* ------------------------------------------------------------------ */
/*  VIEW INVOICE MODAL                                               */
/* ------------------------------------------------------------------ */
function InvoiceViewModal({ invoice, onClose, onPay }) {
  const total =
    invoice.invoice_items
      ?.reduce((s, i) => s + (i.total || i.quantity * i.unit_price), 0)
      .toFixed(2) || "0.00";

  const isOverdue =
    invoice.status !== "paid" && new Date(invoice.due_date) < new Date();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-screen overflow-y-auto p-6"
      >
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {invoice.invoice_number}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="space-y-3 text-sm">
          <p>
            <strong className="text-gray-700 dark:text-gray-300">
              Client:
            </strong>{" "}
            {invoice.clients?.name || "—"}
          </p>
          <p>
            <strong className="text-gray-700 dark:text-gray-300">
              Issue Date:
            </strong>{" "}
            {format(new Date(invoice.issue_date), "MMM d, yyyy")}
          </p>
          <p>
            <strong className="text-gray-700 dark:text-gray-300">
              Due Date:
            </strong>{" "}
            {format(new Date(invoice.due_date), "MMM d, yyyy")}
          </p>
          <p>
            <strong className="text-gray-700 dark:text-gray-300">
              Status:
            </strong>{" "}
            <StatusBadge status={invoice.status} isOverdue={isOverdue} />
          </p>
          <p>
            <strong className="text-gray-700 dark:text-gray-300">Total:</strong>{" "}
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              ${total}
            </span>
          </p>
        </div>

        <div className="mt-6">
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
            Items
          </h3>
          <div className="space-y-2">
            {invoice.invoice_items?.map((it, i) => (
              <div
                key={i}
                className="flex justify-between text-sm bg-gray-50 dark:bg-gray-700 p-3 rounded"
              >
                <span className="text-gray-700 dark:text-gray-300">
                  {it.description} × {it.quantity}
                </span>
                <span className="text-gray-900 dark:text-white">
                  @ ${it.unit_price} = $
                  {(it.total || it.quantity * it.unit_price).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          {invoice.status !== "paid" && (
            <button
              onClick={() => onPay(invoice)}
              className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center gap-2 transition"
            >
              <CreditCard className="w-4 h-4" />
              Pay Now
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium text-gray-700 dark:text-gray-300"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
