import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Thermometer, MapPinned, BellRing } from "lucide-react";
import Navbar from "../components/Navbar.jsx";

export default function Landing() {
  return (
    <div>
      <Navbar />
      <section className="mx-auto max-w-6xl px-5 pb-16 pt-14 md:pt-20">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-4xl font-semibold leading-tight text-ink-900 md:text-5xl"
            >
              Don't just measure the heat. Understand what it does to a body.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-5 max-w-md text-lg text-ink-600"
            >
              SmartHeat AI turns temperature, humidity, wind and radiation into a single human
              thermal-stress score, then warns people before the heat becomes dangerous.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-full bg-sun-500 px-6 py-3 font-medium text-white shadow-soft transition hover:bg-sun-600"
              >
                Open live dashboard <ArrowRight size={18} />
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-full border border-ink-200 px-6 py-3 font-medium text-ink-800 transition hover:border-sun-300"
              >
                Create an account
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="rounded-[2rem] border border-ink-100 bg-white p-8 shadow-soft"
          >
            <p className="text-sm text-ink-400">Right now, in Lucknow</p>
            <p className="mt-1 font-display text-5xl font-semibold text-ink-900">42°C</p>
            <p className="text-sm text-ink-500">Feels like 47°C · Humidity 70%</p>
            <div className="mt-6 rounded-2xl bg-risk-extreme/10 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-risk-extreme">Extreme thermal risk</p>
              <p className="mt-1 text-sm text-ink-700">Thermal stress score 82 / 100 — avoid outdoor exertion during peak hours.</p>
            </div>
          </motion.div>
        </div>

        <div className="mt-24 grid gap-6 md:grid-cols-3">
          {[
            { icon: Thermometer, title: "Beyond the thermometer", body: "Heat Index and WBGT combine temperature, humidity, wind and radiation into one thermal-stress score." },
            { icon: MapPinned, title: "See risk by place", body: "An interactive map shows which locations are heading into heatwave-level thermal stress right now." },
            { icon: BellRing, title: "Early, localized warning", body: "Alerts are generated the moment a location crosses a risk threshold, with SMS and WhatsApp delivery." },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-ink-100 bg-white p-6">
              <f.icon size={22} className="text-sun-500" />
              <h3 className="mt-4 font-display text-lg font-semibold text-ink-900">{f.title}</h3>
              <p className="mt-2 text-sm text-ink-600">{f.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
