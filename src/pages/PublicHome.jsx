import { Link } from "react-router-dom";
import {
  FileText,
  Users,
  DollarSign,
  ArrowRight,
  Check,
  Zap,
  Shield,
} from "lucide-react";

export default function PublicHome() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* HERO */}
      <section className="relative overflow-hidden py-20 px-6">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10" />
        <div className="relative max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
            InvoicePilot – Smart Invoicing
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-10">
            Create beautiful invoices, track payments, and manage clients – all
            in one sleek dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition"
            >
              Get Started <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-4 border-2 border-blue-600 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition"
            >
              Sign Up Free
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className gyn="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose InvoicePilot?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: FileText,
                title: "Instant PDF Invoices",
                desc: "Generate, customize, and download invoices in seconds.",
                color: "from-blue-500 to-cyan-500",
              },
              {
                icon: Users,
                title: "Client CRM",
                desc: "Store contacts, addresses, and payment history.",
                color: "from-purple-500 to-pink-500",
              },
              {
                icon: DollarSign,
                title: "Stripe Payments",
                desc: "Accept cards, get paid instantly, track everything.",
                color: "from-emerald-500 to-teal-500",
              },
            ].map((f, i) => (
              <div
                key={i}
                className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${f.color} opacity-5 rounded-2xl`}
                />
                <div className="relative z-10">
                  <div
                    className={`p-4 rounded-xl bg-gradient-to-br ${f.color} text-white inline-block mb-4`}
                  >
                    <f.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {f.title}
                  </h3>
                  <p className="text-gray-600">{f.desc}</p>
                </div>
                <div className="mt-6 flex items-center text-sm font-medium text-blue-600">
                  Learn more <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS (optional) */}
      <section className="py-20 px-6 bg-white/50">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">
            Loved by Freelancers & Teams
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah K.",
                role: "Freelance Designer",
                text: "Cut my invoicing time in half!",
              },
              {
                name: "Mark T.",
                role: "Agency Owner",
                text: "Clients pay faster with Stripe integration.",
              },
              {
                name: "Lisa M.",
                role: "Consultant",
                text: "Clean UI, no learning curve.",
              },
            ].map((t, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-md">
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, s) => (
                    <Zap
                      key={s}
                      className="w-5 h-5 text-yellow-500 fill-current"
                    />
                  ))}
                </div>
                <p className="text-gray-700 italic mb-4">"{t.text}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{t.name}</div>
                  <div className="text-sm text-gray-500">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Ready to <span className="text-blue-600">Simplify</span> Your
            Billing?
          </h2>
          <Link
            to="/register"
            className="inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition"
          >
            Start Free Trial <Check className="w-6 h-6" />
          </Link>
          <p className="mt-4 text-gray-600">
            No credit card required • Cancel anytime
          </p>
        </div>
      </section>
    </div>
  );
}
