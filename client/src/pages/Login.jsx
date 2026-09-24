import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Phone, Lock, ArrowRight } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import { loginUser } from "../services/authApi.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const [form, setForm] = useState({ phone: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await loginUser(form);
      login(res.token, res.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Could not sign in. Check your phone number and password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto flex max-w-md flex-col px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="inline-flex items-center gap-2 rounded-full bg-sun-100/80 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-sun-700">
            Citizen & Admin Access
          </div>
          <h1 className="mt-3 font-display text-3xl font-semibold text-ink-900">Sign in to SmartHeat</h1>
          <p className="mt-2 text-ink-600">Track heat risk, view IMD forecasts, and manage your emergency SMS/WhatsApp alerts.</p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-ink-700">
                <Phone size={15} className="text-sun-600" />
                Phone Number
              </label>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="e.g. 6387978626 or +91 63879 78626"
                autoComplete="tel"
                className="mt-1.5 w-full rounded-xl border border-ink-100 bg-white px-4 py-3 text-ink-900 placeholder:text-ink-400 outline-none transition focus:border-sun-400 focus:ring-2 focus:ring-sun-200/50"
              />
              <p className="mt-1 text-xs text-ink-400">Use your registered 10-digit mobile number</p>
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-ink-700">
                <Lock size={15} className="text-sun-600" />
                Password
              </label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                autoComplete="current-password"
                className="mt-1.5 w-full rounded-xl border border-ink-100 bg-white px-4 py-3 text-ink-900 placeholder:text-ink-400 outline-none transition focus:border-sun-400 focus:ring-2 focus:ring-sun-200/50"
              />
            </div>
            {error && (
              <div className="rounded-xl border border-risk-extreme/20 bg-risk-extreme/10 px-4 py-3 text-sm text-risk-extreme">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-sun-500 px-6 py-3 font-medium text-white transition hover:bg-sun-600 disabled:opacity-60 shadow-sm"
            >
              {loading ? "Signing in…" : (
                <>
                  <span>Sign in</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-ink-500">
            Don't have an account?{" "}
            <Link to="/register" className="font-semibold text-sun-700 hover:text-sun-800">
              Create one with your phone
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
