// src/pages/ClientsPage.jsx
import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import DashboardPageLoader from "../components/DashboardPageLoader";
import PageHeader from "../components/PageHeader";
import { toast } from "react-hot-toast";
import {
  Users,
  Plus,
  Search,
  Eye,
  Trash2,
  BadgeCheck,
  Loader2,
  X,
  Mail,
  Phone,
  MapPin,
  Edit,
  Calendar,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import useModalScrollLock from "../hooks/useModalScrollLock";

export default function ClientsPage() {
  const navigate = useNavigate();

  // 1. STATE
  const [user, setUser] = useState(null);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

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

  // 3. FETCH CLIENTS
  useEffect(() => {
    const fetchClients = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const { data } = await api.get(
          `/api/clients`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
        const sorted = (data.clients || []).sort((a, b) =>
          a.name.localeCompare(b.name),
        );
        setClients(sorted);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load clients");
        toast.error("Failed to load clients");
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, [user]);

  // 4. SEARCH FILTER
  const filtered = useMemo(() => {
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.email && c.email.toLowerCase().includes(search.toLowerCase())) ||
        (c.phone && c.phone.includes(search)) ||
        (c.address && c.address.toLowerCase().includes(search.toLowerCase())),
    );
  }, [clients, search]);

  // 5. STATS
  const stats = useMemo(() => {
    return [
      {
        label: "Total Clients",
        value: filtered.length,
        icon: Users,
        color: "from-violet-500 to-purple-500",
      },
      {
        label: "Verified Clients",
        value: "1",
        icon: BadgeCheck,
        color: "from-amber-500 to-orange-500",
      },
    ];
  }, [filtered]);

  // 6. ACTIONS
  const handleDelete = useCallback(async (id) => {
    if (!window.confirm("Delete this client and all related invoices?")) return;
    try {
      await api.delete(
        `/api/clients/${id}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      setClients((prev) => prev.filter((c) => c.id !== id));
      toast.success("Client deleted");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to delete");
    }
  }, []);

  const handleCreateSuccess = useCallback((newClient) => {
    setClients((prev) =>
      [...prev, newClient].sort((a, b) => a.name.localeCompare(b.name)),
    );
    setShowCreate(false);
    toast.success("Client created!");
  }, []);

  const handleEditSuccess = useCallback((updated) => {
    setClients((prev) =>
      prev
        .map((c) => (c.id === updated.id ? updated : c))
        .sort((a, b) => a.name.localeCompare(b.name)),
    );
    setShowEdit(false);
    toast.success("Client updated!");
  }, []);

  // 7. UI
  if (!user) return null;

  return (
    <div className="h-full space-y-8 pb-12">
      <div className="max-w-7xl mx-auto p-6 pt-24 space-y-8">
        {/* HEADER */}
        <PageHeader
          title="Clients"
          description="Manage all your clients in one place."
          icon={Users}
          action={
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCreate(true)}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-violet-500 text-white rounded-xl shadow-lg hover:shadow-xl transition font-medium"
          >
            <Plus className="w-5 h-5" />
            New Client
          </motion.button>
          }
        />

        {/* ERROR */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* STATS GRID */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
          {stats.map((s, i) => (
            <div
              key={i}
              className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow overflow-hidden"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${s.color} opacity-5 group-hover:opacity-10 transition-opacity`}
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
            </div>
          ))}
        </section>

        {/* SEARCH */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors z-10" />
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 bg-white dark:bg-gray-800 outline-none transition"
          />
        </div>

        {/* TABLE */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <DashboardPageLoader message="Loading clients..." className="min-h-[240px]" />
          ) : filtered.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-20 h-20 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                {search ? "No clients match your search." : "No clients yet."}
              </h3>
              <p className="text-gray-500">
                Create your first client to get started!
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="bg-gray-50/80 dark:bg-gray-700/80 border-b border-gray-100 dark:border-gray-700">
                  <tr className="text-gray-600 dark:text-gray-300 font-semibold">
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Phone</th>
                    <th className="px-6 py-4">Address</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                  {filtered.map((c) => (
                      <tr
                        key={c.id}
                        className="hover:bg-purple-50/50 dark:hover:bg-purple-900/10 transition-colors cursor-pointer group"
                        onClick={() => setSelectedClient(c)}
                      >
                        <td className="px-6 py-4 font-medium text-purple-700 dark:text-purple-400">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                              {c.name.charAt(0).toUpperCase()}
                            </div>
                            {c.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-800 dark:text-gray-200">
                          {c.email ? (
                            <a
                              href={`mailto:${c.email}`}
                              className="hover:text-purple-600 flex items-center gap-1.5 transition"
                            >
                              <Mail className="w-3.5 h-3.5 text-gray-400" />{" "}
                              {c.email}
                            </a>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                          {c.phone ? (
                            <a
                              href={`tel:${c.phone}`}
                              className="hover:text-purple-600 flex items-center gap-1.5 transition"
                            >
                              <Phone className="w-3.5 h-3.5 text-gray-400" />{" "}
                              {c.phone}
                            </a>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400 truncate max-w-[200px]">
                          {c.address || "—"}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-1 opacity-100">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedClient(c);
                              }}
                              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedClient(c);
                                setShowEdit(true);
                              }}
                              className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-500 transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(c.id);
                              }}
                              className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* MODALS */}
      <AnimatePresence>
        {showCreate && (
          <ClientFormModal
            onClose={() => setShowCreate(false)}
            onSuccess={handleCreateSuccess}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showEdit && selectedClient && (
          <ClientFormModal
            client={selectedClient}
            onClose={() => setShowEdit(false)}
            onSuccess={handleEditSuccess}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {selectedClient && !showEdit && (
          <ClientViewModal
            client={selectedClient}
            onClose={() => setSelectedClient(null)}
            onEdit={() => setShowEdit(true)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ------------------------------------------------------------------
// CLIENT FORM (Create / Edit)
// ------------------------------------------------------------------
function ClientFormModal({ client, onClose, onSuccess }) {
  const modalRef = useRef(null);
  useModalScrollLock(true, modalRef);
  const isEdit = !!client;
  const [form, setForm] = useState({
    name: client?.name || "",
    email: client?.email || "",
    phone: client?.phone || "",
    address: client?.address || "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const err = {};
    if (!form.name.trim()) err.name = "Name is required";
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email))
      err.email = "Invalid email format";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      let res;
      if (isEdit) {
        res = await api.put(
          `/api/clients/${client.id}`,
          form,
          { headers: { Authorization: `Bearer ${token}` } },
        );
      } else {
        res = await api.post(
          `/api/clients`,
          form,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
      }
      onSuccess(res.data.client);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to save client");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      ref={modalRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="modal-scroll-lock fixed inset-0 bg-gray-900/60 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto custom-scrollbar p-6 sm:p-8"
      >
        <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEdit ? "Edit Client" : "Create Client"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Full Name *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={`w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50 dark:bg-gray-700/50 ${errors.name ? "border-red-500" : "border-gray-200 dark:border-gray-600"}`}
              required
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1.5">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50 dark:bg-gray-700/50"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1.5">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Phone Number
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50 dark:bg-gray-700/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Billing Address
            </label>
            <textarea
              rows={3}
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50 dark:bg-gray-700/50 resize-none"
            />
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-gray-100 dark:border-gray-700 mt-6">
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
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-violet-500 text-white rounded-xl hover:opacity-90 font-medium flex items-center gap-2 transition active:scale-95 disabled:opacity-70"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {isEdit ? "Save Changes" : "Create Client"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ------------------------------------------------------------------
// CLIENT VIEW MODAL
// ------------------------------------------------------------------
function ClientViewModal({ client, onClose, onEdit }) {
  const modalRef = useRef(null);
  useModalScrollLock(true, modalRef);

  return (
    <motion.div
      ref={modalRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="modal-scroll-lock fixed inset-0 bg-gray-900/60 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar p-6 sm:p-8 relative"
      >
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-purple-100 to-violet-100 dark:from-purple-900/20 dark:to-violet-900/20" />

        <div className="relative z-10 flex justify-between items-start mb-8">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center text-white text-3xl font-bold shadow-xl border-4 border-white dark:border-gray-800">
              {client.name.charAt(0).toUpperCase()}
            </div>
            <div className="mt-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {client.name}
              </h2>
              <span className="inline-block mt-1 px-2.5 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-semibold rounded-full">
                Client Profile
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white dark:bg-gray-800 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10 bg-gray-50 dark:bg-gray-700/30 p-6 rounded-xl border border-gray-100 dark:border-gray-700">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500  tracking-wider font-semibold mb-0.5">
                  Email Address
                </p>
                {client.email ? (
                  <a
                    href={`mailto:${client.email}`}
                    className="text-gray-900 dark:text-white font-medium hover:text-purple-600 transition"
                  >
                    {client.email}
                  </a>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500  tracking-wider font-semibold mb-0.5">
                  Phone Number
                </p>
                {client.phone ? (
                  <a
                    href={`tel:${client.phone}`}
                    className="text-gray-900 dark:text-white font-medium hover:text-purple-600 transition"
                  >
                    {client.phone}
                  </a>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500  tracking-wider font-semibold mb-0.5">
                  Billing Address
                </p>
                <p className="text-gray-900 dark:text-white font-medium leading-relaxed">
                  {client.address || "—"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500  tracking-wider font-semibold mb-0.5">
                  Member Since
                </p>
                <p className="text-gray-900 dark:text-white font-medium">
                  {client.created_at
                    ? new Date(client.created_at).toLocaleDateString(
                        undefined,
                        { year: "numeric", month: "long", day: "numeric" },
                      )
                    : "—"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex gap-3 relative z-10">
          <button
            onClick={onEdit}
            className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition active:scale-95 shadow-md"
          >
            <Edit className="w-4 h-4" /> Edit Details
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl font-medium text-gray-700 dark:text-white transition active:scale-95 border border-gray-200 dark:border-gray-600"
          >
            Close Panel
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
