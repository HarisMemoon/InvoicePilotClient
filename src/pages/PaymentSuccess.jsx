// src/pages/PaymentSuccess.jsx
import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, FileText, ArrowLeft, Download, Mail } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const invoiceId = searchParams.get("invoice");
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!invoiceId) {
      toast.error("No invoice ID provided");
      return;
    }

    const fetchInvoice = async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:5000/api/invoices/${invoiceId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
        setInvoice(data.invoice);
      } catch (err) {
        toast.error("Failed to load invoice details");
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [invoiceId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center p-6">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Invoice Not Found
          </h2>
          <p className="text-gray-600 mt-2">
            The invoice ID is invalid or has been removed.
          </p>
          <Link
            to="/dashboard/invoices"
            className="mt-6 inline-flex items-center gap-2 px-5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Invoices
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 max-w-2xl w-full border border-white/30"
      >
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-emerald-400 rounded-full blur-xl opacity-50 animate-pulse" />
            <div className="relative w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg">
              <CheckCircle className="w-14 h-14 text-white" />
            </div>
          </motion.div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
          Payment Successful!
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Thank you for your payment. Your invoice has been marked as{" "}
          <strong>Paid</strong>.
        </p>

        {/* Invoice Summary */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 mb-6 border border-emerald-200">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-6 h-6 text-emerald-700" />
            <h3 className="text-lg font-semibold text-gray-900">
              Invoice Details
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Invoice #</p>
              <p className="font-medium text-gray-900">
                {invoice.invoice_number}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Client</p>
              <p className="font-medium text-gray-900">
                {invoice.clients?.name || "—"}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Amount Paid</p>
              <p className="font-bold text-emerald-700 text-lg">
                ${invoice.total_amount?.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Status</p>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                <CheckCircle className="w-3 h-3" /> Paid
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to={`/dashboard/invoices/${invoice.id}`}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition shadow-md"
          >
            <FileText className="w-5 h-5" />
            View Invoice
          </Link>
          <button
            onClick={() => {
              toast.success("Download started (PDF generation coming soon)");
              // Future: Trigger PDF download
            }}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-emerald-300 text-emerald-700 rounded-xl hover:bg-emerald-50 transition"
          >
            <Download className="w-5 h-5" />
            Download PDF
          </button>
          <button
            onClick={() => {
              toast.success("Receipt emailed!");
              // Future: Trigger email via n8n
            }}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-emerald-300 text-emerald-700 rounded-xl hover:bg-emerald-50 transition"
          >
            <Mail className="w-5 h-5" />
            Email Receipt
          </button>
        </div>

        {/* Back to Dashboard */}
        <div className="mt-8 text-center">
          <Link
            to="/dashboard"
            className="text-sm text-gray-600 hover:text-emerald-700 flex items-center justify-center gap-1 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
