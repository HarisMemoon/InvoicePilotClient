// src/pages/ClientsPage.jsx
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  Users,
  Plus,
  Search,
  Eye,
  Trash2,
  Loader2,
  X,
  Mail,
  Phone,
  MapPin,
  Edit,
  Building,
  Calendar,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ClientsPage() {
  const navigate = useNavigate();

  // ------------------------------------------------------------------
  // 1. STATE
  // ------------------------------------------------------------------
  const [user, setUser] = useState(null);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

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
  // 3. FETCH CLIENTS
  // ------------------------------------------------------------------
  useEffect(() => {
    const fetch = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const { data } = await axios.get("http://localhost:5000/api/clients", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const sorted = (data.clients || []).sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        setClients(sorted);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load clients");
        toast.error("Failed to load clients");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user]);

  // ------------------------------------------------------------------
  // 4. SEARCH FILTER
  // ------------------------------------------------------------------
  const filtered = useMemo(() => {
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.email && c.email.toLowerCase().includes(search.toLowerCase())) ||
        (c.phone && c.phone.includes(search)) ||
        (c.address && c.address.toLowerCase().includes(search.toLowerCase()))
    );
  }, [clients, search]);

  // ------------------------------------------------------------------
  // 5. STATS
  // ------------------------------------------------------------------
  const stats = useMemo(() => {
    const total = filtered.length;
    const withEmail = filtered.filter((c) => c.email).length;
    const withPhone = filtered.filter((c) => c.phone).length;
    const withAddress = filtered.filter((c) => c.address).length;

    return [
      {
        label: "Total Clients",
        value: total,
        icon: Users,
        color: "from-violet-500 to-purple-500",
      },
    ];
  }, [filtered]);

  // ------------------------------------------------------------------
  // 6. ACTIONS
  // ------------------------------------------------------------------
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this client and all related invoices?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/clients/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setClients((prev) => prev.filter((c) => c.id !== id));
      toast.success("Client deleted");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to delete");
    }
  };

  const handleCreateSuccess = (newClient) => {
    setClients((prev) =>
      [...prev, newClient].sort((a, b) => a.name.localeCompare(b.name))
    );
    setShowCreate(false);
    toast.success("Client created!");
  };

  const handleEditSuccess = (updated) => {
    setClients((prev) =>
      prev
        .map((c) => (c.id === updated.id ? updated : c))
        .sort((a, b) => a.name.localeCompare(b.name))
    );
    setShowEdit(false);
    toast.success("Client updated!");
  };

  // ------------------------------------------------------------------
  // 7. UI
  // ------------------------------------------------------------------
  if (!user) return null;

  return (
    <div className="h-full space-y-8">
      <div className="max-w-7xl mx-auto p-6 pt-24 space-y-8">
        {/* HEADER */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Users className="w-9 h-9 text-purple-600 dark:text-purple-400" />
              Clients
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage all your clients in one place.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-violet-500 text-white rounded-xl shadow-lg hover:shadow-xl transition"
          >
            <Plus className="w-5 h-5" />
            New Client
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
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
              <div className="absolute -bottom-1 -right-1 w-20 h-20 bg-gradient-to-br from-purple-400 to-violet-600 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity" />
            </motion.div>
          ))}
        </section>

        {/* SEARCH */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search by name, email, phone, or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition"
          />
        </div>

        {/* TABLE */}
        <section className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-10 h-10 mx-auto animate-spin text-purple-600 dark:text-purple-400" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                {search
                  ? "No clients match your search."
                  : "No clients yet. Create your first one!"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50/70 dark:bg-gray-700/50">
                  <tr className="text-left text-gray-600 dark:text-gray-300 font-medium">
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Phone</th>
                    <th className="px-6 py-4">Address</th>
                    <th className="!text-right px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {filtered.map((c) => (
                    <motion.tr
                      key={c.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-purple-50/50 dark:hover:bg-purple-900/20 transition-colors cursor-pointer"
                      onClick={() => setSelectedClient(c)}
                    >
                      <td className="px-6 py-4 font-medium text-purple-700 dark:text-purple-400">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
                            {c.name.charAt(0).toUpperCase()}
                          </div>
                          {c.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-800 dark:text-gray-200">
                        {c.email ? (
                          <a
                            href={`mailto:${c.email}`}
                            className="hover:underline flex items-center gap-1"
                          >
                            <Mail className="w-3 h-3" /> {c.email}
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                        {c.phone ? (
                          <a
                            href={`tel:${c.phone}`}
                            className="hover:underline flex items-center gap-1"
                          >
                            <Phone className="w-3 h-3" /> {c.phone}
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400 truncate max-w-xs">
                        {c.address || "—"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedClient(c);
                            }}
                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                            title="View"
                          >
                            <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedClient(c);
                              setShowEdit(true);
                            }}
                            className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(c.id);
                            }}
                            className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
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
            onEdit={() => {
              setShowEdit(true);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  CLIENT FORM (Create / Edit)                                      */
/* ------------------------------------------------------------------ */
function ClientFormModal({ client, onClose, onSuccess }) {
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
      err.email = "Invalid email";
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
        res = await axios.put(
          `http://localhost:5000/api/clients/${client.id}`,
          form,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        res = await axios.post("http://localhost:5000/api/clients", form, {
          headers: { Authorization: `Bearer ${token}` },
        });
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
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full p-6"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEdit ? "Edit Client" : "Create Client"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                errors.name
                  ? "border-red-500 dark:border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              }`}
              required
            />
            {errors.name && (
              <p className="text-red-500 dark:text-red-400 text-xs mt-1">
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            {errors.email && (
              <p className="text-red-500 dark:text-red-400 text-xs mt-1">
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Phone
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Address
            </label>
            <textarea
              rows={3}
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex gap-3 justify-end mt-6">
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
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-violet-500 text-white rounded-lg hover:shadow-lg flex items-center gap-2 disabled:opacity-70"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {isEdit ? "Update" : "Create"} Client
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  CLIENT VIEW MODAL                                                */
/* ------------------------------------------------------------------ */
function ClientViewModal({ client, onClose, onEdit }) {
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
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full p-6"
      >
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {client.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {client.name}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Client Profile
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Email
                </p>
                {client.email ? (
                  <a
                    href={`mailto:${client.email}`}
                    className="text-gray-900 dark:text-white hover:underline"
                  >
                    {client.email}
                  </a>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Phone
                </p>
                {client.phone ? (
                  <a
                    href={`tel:${client.phone}`}
                    className="text-gray-900 dark:text-white hover:underline"
                  >
                    {client.phone}
                  </a>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Address
                </p>
                <p className="text-gray-900 dark:text-white">
                  {client.address || "—"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Member Since
                </p>
                <p className="text-gray-900 dark:text-white">
                  {client.created_at
                    ? new Date(client.created_at).toLocaleDateString()
                    : "—"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <button
            onClick={onEdit}
            className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center justify-center gap-2 transition"
          >
            <Edit className="w-4 h-4" />
            Edit Client
          </button>
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
