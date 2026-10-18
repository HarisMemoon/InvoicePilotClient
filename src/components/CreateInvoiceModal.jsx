// src/components/CreateInvoiceModal.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Minus, X } from "lucide-react";
import { toast } from "react-hot-toast";
import ModalWrapper from "./ModalWrapper";

export default function CreateInvoiceModal({ isOpen, onClose, onSuccess }) {
  const [clients, setClients] = useState([]);
  const [formData, setFormData] = useState({
    client_id: "",
    invoice_number: "",
    issue_date: new Date().toISOString().split("T")[0],
    due_date: "",
    status: "draft",
    items: [{ description: "", quantity: 1, unit_price: 0 }],
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  /* ---------- FETCH CLIENTS ---------- */
  useEffect(() => {
    if (!isOpen) return;
    const fetch = async () => {
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
      } catch {
        toast.error("Failed to load clients");
      }
    };
    fetch();
  }, [isOpen]);

  /* ---------- HANDLERS ---------- */
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleItemChange = (i, e) => {
    const newItems = [...formData.items];
    newItems[i][e.target.name] = e.target.value;
    setFormData({ ...formData, items: newItems });
  };
  const addItem = () =>
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { description: "", quantity: 1, unit_price: 0 },
      ],
    });
  const removeItem = (i) =>
    setFormData({
      ...formData,
      items: formData.items.filter((_, idx) => idx !== i),
    });

  const total = () =>
    formData.items
      .reduce((s, it) => s + it.quantity * it.unit_price, 0)
      .toFixed(2);

  const validate = () => {
    const e = {};
    if (!formData.client_id) e.client_id = "Select a client";
    if (!formData.invoice_number) e.invoice_number = "Required";
    if (!formData.due_date) e.due_date = "Required";
    formData.items.forEach((it, i) => {
      if (!it.description) e[`d${i}`] = "Description required";
      if (it.quantity <= 0) e[`q${i}`] = "Qty > 0";
      if (it.unit_price < 0) e[`p${i}`] = "Price ≥ 0";
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/invoices`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalWrapper onClose={onClose}>
      <h2 className="mb-6 text-2xl font-bold text-gray-900">Create Invoice</h2>

      {/* ==== TOP ROW ==== */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* CLIENT */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Client
          </label>
          <select
            name="client_id"
            value={formData.client_id}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
              errors.client_id ? "border-red-500" : ""
            }`}
          >
            <option value="">-- select --</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.client_id && (
            <p className="mt-1 text-xs text-red-600">{errors.client_id}</p>
          )}
        </div>

        {/* INVOICE NUMBER */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Invoice Number
          </label>
          <input
            type="text"
            name="invoice_number"
            value={formData.invoice_number}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
              errors.invoice_number ? "border-red-500" : ""
            }`}
          />
          {errors.invoice_number && (
            <p className="mt-1 text-xs text-red-600">{errors.invoice_number}</p>
          )}
        </div>

        {/* ISSUE DATE */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Issue Date
          </label>
          <input
            type="date"
            name="issue_date"
            value={formData.issue_date}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* DUE DATE */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Due Date
          </label>
          <input
            type="date"
            name="due_date"
            value={formData.due_date}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
              errors.due_date ? "border-red-500" : ""
            }`}
          />
          {errors.due_date && (
            <p className="mt-1 text-xs text-red-600">{errors.due_date}</p>
          )}
        </div>
      </div>

      {/* ==== ITEMS ==== */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">Items</h3>
          <button
            type="button"
            onClick={addItem}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
          >
            <Plus className="h-4 w-4" /> Add Item
          </button>
        </div>

        {formData.items.map((it, i) => (
          <div key={i} className="grid grid-cols-12 items-center gap-2 mb-2">
            {/* DESCRIPTION */}
            <input
              type="text"
              placeholder="Description"
              name="description"
              value={it.description}
              onChange={(e) => handleItemChange(i, e)}
              className={`col-span-5 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                errors[`d${i}`] ? "border-red-500" : ""
              }`}
            />
            {/* QTY */}
            <input
              type="number"
              placeholder="Qty"
              name="quantity"
              value={it.quantity}
              onChange={(e) => handleItemChange(i, e)}
              className={`col-span-2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                errors[`q${i}`] ? "border-red-500" : ""
              }`}
            />
            {/* PRICE */}
            <input
              type="number"
              placeholder="Price"
              name="unit_price"
              value={it.unit_price}
              onChange={(e) => handleItemChange(i, e)}
              className={`col-span-3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                errors[`p${i}`] ? "border-red-500" : ""
              }`}
            />
            {/* SUBTOTAL */}
            <div className="col-span-1 text-right font-medium text-gray-900">
              ${(it.quantity * it.unit_price).toFixed(2)}
            </div>
            {/* REMOVE */}
            <button
              type="button"
              onClick={() => removeItem(i)}
              disabled={formData.items.length === 1}
              className="text-red-600 hover:text-red-800 disabled:opacity-50"
            >
              <Minus className="h-4 w-4" />
            </button>
          </div>
        ))}

        <div className="mt-4 text-right text-lg font-bold text-gray-900">
          Total: ${total()}
        </div>
      </div>

      {/* ==== SUBMIT ==== */}
      <button
        onClick={submit}
        disabled={loading}
        className="mt-6 w-full rounded-md bg-blue-600 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {loading ? "Creating…" : "Create Invoice"}
      </button>
    </ModalWrapper>
  );
}
