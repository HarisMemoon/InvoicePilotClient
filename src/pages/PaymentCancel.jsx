// src/pages/PaymentCancel.jsx
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { XCircle, ArrowLeft, FileText } from "lucide-react";

export default function PaymentCancel() {
  const [searchParams] = useSearchParams();
  const invoiceId = searchParams.get("invoice");

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-pink-100 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 max-w-2xl w-full border border-white/30"
      >
        {/* Fail Icon */}
        <div className="flex justify-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-red-400 rounded-full blur-xl opacity-50 animate-pulse" />
            <div className="relative w-24 h-24 bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center shadow-lg">
              <XCircle className="w-14 h-14 text-white" />
            </div>
          </motion.div>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-2">
          Payment Cancelled
        </h1>
        <p className="text-center text-gray-600 mb-8">
          No worries — your invoice is still <strong>unpaid</strong>. You can
          try again anytime.
        </p>

        {/* Invoice Info */}
        {invoiceId && (
          <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-2xl p-6 mb-6 border border-red-200">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-red-700" />
              <h3 className="text-lg font-semibold text-gray-900">
                Invoice Pending
              </h3>
            </div>
            <p className="text-sm text-gray-700">
              Invoice ID:{" "}
              <span className="font-mono font-medium">{invoiceId}</span>
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to={`/dashboard/invoices/${invoiceId}`}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition shadow-md"
          >
            <FileText className="w-5 h-5" />
            View Invoice
          </Link>
          <Link
            to="/dashboard/invoices"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-red-300 text-red-700 rounded-xl hover:bg-red-50 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Invoices
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Need help?{" "}
            <Link to="/support" className="text-red-600 hover:underline">
              Contact Support
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
