import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { CreditCard, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe("your-publishable-key-here"); // From Stripe dashboard

function CheckoutForm({ invoice, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Create PaymentIntent on backend
      const {
        data: { clientSecret },
      } = await axios.post(
        "http://localhost:5000/api/stripe/create-payment-intent",
        {
          invoiceId: invoice.id,
          amount: invoice.total_amount * 100, // Cents
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      const { error: stripeError } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: { card: elements.getElement(CardElement) },
        }
      );

      if (stripeError) throw new Error(stripeError.message);

      toast.success("Payment successful!");
      onSuccess();
    } catch (err) {
      setError(err.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <CardElement className="p-3 border rounded-lg" />
      {error && <p className="text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
      >
        {loading ? "Processing..." : `Pay $${invoice.total_amount}`}
      </button>
    </form>
  );
}

export default function PaymentsPage() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Auth Check
  useEffect(() => {
    const rawUser = localStorage.getItem("user");
    if (!rawUser || rawUser === "undefined" || rawUser === "null") {
      navigate("/login", { replace: true });
      return;
    }
    try {
      const parsed = JSON.parse(rawUser);
      setUser(parsed);
    } catch (err) {
      console.error("Corrupted user data:", err);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  // Fetch Payments (Assume backend joins with invoices)
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        setError("");
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/payments", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPayments(res.data.payments || []);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load payments");
        toast.error("Failed to load payments");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchPayments();
    }
  }, [user]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (!user) return null;

  return (
    <Elements stripe={stripePromise}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Payments</h1>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm">
              <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No payments yet.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Invoice
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Paid At
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {payments.map((payment) => (
                      <tr
                        key={payment.id}
                        className="hover:bg-gray-50 transition"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {payment.invoice?.invoice_number || "—"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${payment.amount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                              payment.status === "paid"
                                ? "bg-green-100 text-green-800"
                                : payment.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {payment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {payment.paid_at ? formatDate(payment.paid_at) : "—"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => setSelectedInvoice(payment.invoice)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Payment Modal for Selected Invoice */}
        {selectedInvoice && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-lg w-full">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">
                  Pay Invoice {selectedInvoice.invoice_number}
                </h2>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              <p className="mb-4 text-gray-600">
                Total: ${selectedInvoice.total_amount.toFixed(2)}
              </p>
              <CheckoutForm
                invoice={selectedInvoice}
                onSuccess={() => {
                  setSelectedInvoice(null);
                  // Refetch payments
                }}
              />
            </div>
          </div>
        )}
      </div>
    </Elements>
  );
}
