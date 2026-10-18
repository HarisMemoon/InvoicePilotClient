// src/pages/PublicHome.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Users,
  DollarSign,
  ArrowRight,
  Check,
  Star,
  Shield,
  Zap,
  ChevronRight,
  Sun,
  Moon,
  Menu,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "../hooks/useDarkMode";

export default function PublicHome() {
  const { isDark, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const fadeUpVariants = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 80, damping: 20 },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0C10] text-gray-900 dark:text-gray-100 font-inter selection:bg-blue-500/30 transition-colors duration-300">
      {/* BACKGROUND EFFECTS */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-400/20 via-transparent to-transparent dark:from-blue-600/10 dark:via-transparent dark:to-transparent opacity-60 " />
      </div>

      {/* NAVBAR (Mock for structure) */}
      <header className="relative z-50">
        <nav className="relative z-10 max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-2">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
              IP
            </div>
            <div className="text-lg font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              InvoicePilot
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/login"
              className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="text-sm font-medium px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition active:scale-95"
            >
              Sign up
            </Link>
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors shadow-sm"
            >
              {isDark ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={isOpen}
              className="p-2.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none"
            >
              {isOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </nav>

        {/* Mobile Dropdown Menu */}
        {isOpen && (
          <div className="md:hidden px-6 pb-6 pt-2 space-y-3 bg-white/95 dark:bg-gray-900/95  border-b border-gray-200 dark:border-gray-800 shadow-xl">
            <div className="flex flex-col gap-2 pt-2 border-b border-gray-100 dark:border-gray-800">
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="w-full text-center py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                Log in
              </Link>
              <Link
                to="/register"
                onClick={() => setIsOpen(false)}
                className="w-full text-center py-2.5 text-sm font-medium bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg  hover:bg-gray-800 dark:hover:bg-gray-100 transition shadow-sm active:scale-95"
              >
                Sign up
              </Link>
            </div>
            <div className="flex items-center justify-between py-2 ">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                {isDark ? "Apply light theme" : "Apply dark theme"}
              </span>
              <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {isDark ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        )}
      </header>

      {/* HERO SECTION */}
      <section className="relative z-10 pt-24 pb-32 px-6">
        <motion.div
          className="max-w-5xl mx-auto text-center"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          <motion.div
            variants={fadeUpVariants}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 text-blue-600 dark:text-blue-400 text-sm font-medium mb-8"
          >
            <Zap className="w-4 h-4" />
            <span>Now with Stripe Integration</span>
          </motion.div>

          <motion.h1
            variants={fadeUpVariants}
            className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8"
          >
            Smart invoicing for <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-500">
              modern professionals.
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUpVariants}
            className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Create beautiful invoices, manage your clients, and get paid faster.
            The all-in-one billing platform designed to get out of your way.
          </motion.p>

          <motion.div
            variants={fadeUpVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition-all active:scale-95"
            >
              Start for free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-white text-lg font-semibold rounded-xl transition-all active:scale-95"
            >
              View live demo
            </Link>
          </motion.div>

          <motion.p
            variants={fadeUpVariants}
            className="mt-6 text-sm text-gray-500 dark:text-gray-400"
          >
            No credit card required. Free 14-day trial.
          </motion.p>
        </motion.div>
      </section>

      {/* FEATURES BENTO GRID */}
      <section className="relative z-10 py-24 px-6 border-y border-gray-200 dark:border-gray-800/50 bg-white dark:bg-[#0f1117]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-3xl font-bold tracking-tight mb-4">
              Everything you need to scale
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Powerful features hidden behind a simple, intuitive interface.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="md:col-span-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-6">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3">
                Lightning Fast Invoicing
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6 max-w-md">
                Generate professional, branded PDF invoices in seconds. Track
                statuses from draft to paid without breaking a sweat.
              </p>
              <div className="flex items-center text-blue-600 dark:text-blue-400 font-medium cursor-pointer group">
                Explore invoicing{" "}
                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 hover:border-purple-500/50 dark:hover:border-purple-500/50 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-6">
                <DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Global Payments</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                Accept credit cards and ACH globally with our seamless Stripe
                integration.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Client CRM</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Store client details, track history, and maintain relationships
                effortlessly.
              </p>
            </motion.div>

            {/* Feature 4 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="md:col-span-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 hover:border-amber-500/50 dark:hover:border-amber-500/50 transition-colors flex flex-col justify-center"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Bank-grade Security</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed max-w-md">
                Your data is encrypted at rest and in transit. Role-based access
                control and secure authentication keep your business safe.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF / TESTIMONIALS */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-3xl font-bold tracking-tight mb-4">
                Trusted by modern teams
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                See why freelancers, agencies, and consultants are moving to
                InvoicePilot.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Sarah Jenkins",
                role: "Freelance Designer",
                text: "The UI is so clean. It cut my end-of-month billing time from 3 hours to about 15 minutes.",
              },
              {
                name: "Mark Torres",
                role: "Agency Founder",
                text: "Having Stripe integrated means clients just click and pay. Our average invoice payment time dropped by 5 days.",
              },
              {
                name: "Lisa Monroe",
                role: "Tech Consultant",
                text: "Dark mode is gorgeous, the app is blazing fast, and the PDF exports look incredibly professional.",
              },
            ].map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white dark:bg-[#0f1117] border border-gray-200 dark:border-gray-800 rounded-3xl p-8"
              >
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, s) => (
                    <Star
                      key={s}
                      className="w-5 h-5 text-yellow-400 fill-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-lg mb-8 leading-relaxed">
                  "{t.text}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center font-bold text-gray-900 dark:text-white">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {t.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {t.role}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-blue-600 dark:bg-blue-600 rounded-[2.5rem] p-10 md:p-16 text-center relative overflow-hidden shadow-2xl shadow-blue-900/20">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-white opacity-10 rounded-full " />
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-black opacity-10 rounded-full " />

            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                Take control of your billing.
              </h2>
              <p className="text-blue-100 text-lg md:text-xl max-w-2xl mx-auto mb-10">
                Join thousands of professionals getting paid faster. Set up your
                account in under 2 minutes.
              </p>

              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-10 py-4 bg-white text-blue-600 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95"
              >
                Create your free account <Check className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 py-8 text-center text-gray-500 dark:text-gray-400 text-sm border-t border-gray-200 dark:border-gray-800/50">
        <p>© {new Date().getFullYear()} InvoicePilot. All rights reserved.</p>
      </footer>
    </div>
  );
}
