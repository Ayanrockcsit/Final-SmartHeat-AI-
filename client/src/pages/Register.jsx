import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Phone, Mail, Lock, MapPin, ArrowRight, ShieldCheck } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import { registerUser } from "../services/authApi.js";
import { useAuth } from "../context/AuthContext.jsx";

const SUGGESTED_CITIES = ["Lucknow", "Delhi", "Jaipur", "Nagpur", "Ahmedabad", "Varanasi"];

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    location: "Lucknow",
    occupation: "General Public",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (form.phone.replace(/[\s\-\(\)\+]/g, "").length < 10) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    setLoading(true);
    try {
      const res = await registerUser(form);
      login(res.token, res.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Could not create your account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto flex max-w-lg flex-col px-5 py-12">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-sun-100/80 px-3 py-1 text-xs font-semibold text-sun-700">
            <ShieldCheck size={14} /> Early Warning Registration
          </div>
          <h1 className="mt-3 font-display text-3xl font-semibold text-ink-900">Create your account</h1>
          <p className="mt-2 text-ink-600">
            Receive localized heatwave warnings and thermal stress alerts directly to your phone.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-ink-700">
                <User size={15} className="text-sun-600" />
                Full Name
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Ayan Siddiqui"
                className="mt-1.5 w-full rounded-xl border border-ink-100 bg-white px-4 py-3 text-ink-900 placeholder:text-ink-400 outline-none transition focus:border-sun-400 focus:ring-2 focus:ring-sun-200/50"
              />
            </div>

            <div>
              <label className="flex items-center justify-between text-sm font-medium text-ink-700">
                <span className="flex items-center gap-1.5">
                  <Phone size={15} className="text-sun-600" />
                  Phone Number (Primary)
                </span>
                <span className="text-xs font-normal text-sun-700">Required for SMS alerts</span>
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
              <p className="mt-1 text-xs text-ink-400">Heatwave alerts and emergency broadcasts will be sent to this number.</p>
            </div>

            <div>
              <label className="flex items-center justify-between text-sm font-medium text-ink-700">
                <span className="flex items-center gap-1.5">
                  <Mail size={15} className="text-sun-600" />
                  Email Address
                </span>
                <span className="text-xs text-ink-400 font-normal">Optional</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="e.g. ayan@example.com"
                className="mt-1.5 w-full rounded-xl border border-ink-100 bg-white px-4 py-3 text-ink-900 placeholder:text-ink-400 outline-none transition focus:border-sun-400 focus:ring-2 focus:ring-sun-200/50"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-ink-700">
                <Lock size={15} className="text-sun-600" />
                Password (min 6 characters)
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className="mt-1.5 w-full rounded-xl border border-ink-100 bg-white px-4 py-3 text-ink-900 placeholder:text-ink-400 outline-none transition focus:border-sun-400 focus:ring-2 focus:ring-sun-200/50"
              />
            </div>

            <div>
              <label className="flex items-center justify-between text-sm font-medium text-ink-700">
                <span className="flex items-center gap-1.5">
                  <MapPin size={15} className="text-sun-600" />
                  Monitored City / Location
                </span>
              </label>
              <input
                type="text"
                required
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="e.g. Lucknow"
                className="mt-1.5 w-full rounded-xl border border-ink-100 bg-white px-4 py-3 text-ink-900 placeholder:text-ink-400 outline-none transition focus:border-sun-400 focus:ring-2 focus:ring-sun-200/50"
              />
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-ink-400">Quick select:</span>
                {SUGGESTED_CITIES.map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => setForm({ ...form, location: city })}
                    className={`rounded-full px-2.5 py-0.5 text-xs transition ${
                      form.location === city
                        ? "bg-sun-500 font-medium text-white"
                        : "bg-ink-100 text-ink-700 hover:bg-sun-100 hover:text-sun-800"
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-risk-extreme/20 bg-risk-extreme/10 px-4 py-3 text-sm text-risk-extreme">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-sun-500 px-6 py-3.5 font-medium text-white transition hover:bg-sun-600 disabled:opacity-60 shadow-sm"
            >
              {loading ? "Creating account…" : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-500">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-sun-700 hover:text-sun-800">
              Sign in with your phone
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
