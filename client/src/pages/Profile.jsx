import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Bell,
  Shield,
  Key,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Smartphone,
  MessageSquare,
  Save,
  Send,
  Thermometer,
  ArrowRight,
  RefreshCw,
  LogOut,
  Info,
} from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { updateProfile, changePassword } from "../services/authApi.js";
import { getCurrentHeat } from "../services/heatApi.js";
import { sendTestNotification } from "../services/notificationApi.js";

const SUGGESTED_CITIES = ["Lucknow", "Delhi", "Jaipur", "Nagpur", "Ahmedabad", "Varanasi"];

const OCCUPATION_OPTIONS = [
  "General Public",
  "Outdoor / Construction Worker",
  "Delivery & Logistics Partner",
  "Traffic Police & Security Personnel",
  "Agricultural Worker / Farmer",
  "Street Vendor / Market Trader",
  "Office / Indoor Worker",
  "Student / Education Staff",
  "Healthcare Worker",
];

const VULNERABILITY_OPTIONS = [
  "General Public (Standard)",
  "High Heat Exposure (Outdoor > 4 hrs)",
  "Senior Citizen (Age 60+)",
  "Pregnant Woman / Infant Caregiver",
  "Chronic Medical Condition (Cardiovascular / Diabetes)",
];

const THRESHOLD_DESCRIPTIONS = {
  MODERATE: {
    label: "Moderate (>= 33°C)",
    color: "text-amber-700 bg-amber-50 border-amber-200",
    desc: "Alerts for noticeable thermal discomfort and heat caution.",
  },
  HIGH: {
    label: "High (>= 40°C)",
    color: "text-orange-700 bg-orange-50 border-orange-200",
    desc: "Recommended. Alerts when heat stress threatens prolonged activity.",
  },
  EXTREME: {
    label: "Extreme / Heatwave (>= 45°C)",
    color: "text-red-700 bg-red-50 border-red-200",
    desc: "Emergency alerts only when critical IMD heatwave criteria are reached.",
  },
};

export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("profile");

  // Personal Info Form
  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
    email: "",
    location: "Lucknow",
    occupation: "General Public",
    vulnerabilityCategory: "General Public (Standard)",
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileStatus, setProfileStatus] = useState(null);

  // Alerts Preferences Form
  const [alertChannels, setAlertChannels] = useState({
    sms: true,
    whatsapp: false,
  });
  const [alertThreshold, setAlertThreshold] = useState("HIGH");
  const [alertsLoading, setAlertsLoading] = useState(false);
  const [alertsStatus, setAlertsStatus] = useState(null);

  // Test Notification State
  const [testChannel, setTestChannel] = useState("SMS");
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [testError, setTestError] = useState("");

  // Security Form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState(null);

  // Local Heat Weather Snapshot
  const [weatherSnapshot, setWeatherSnapshot] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  // Populate user data
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || "",
        phone: user.phone || "",
        email: user.email || "",
        location: user.location || "Lucknow",
        occupation: user.occupation || "General Public",
        vulnerabilityCategory: user.vulnerabilityCategory || "General Public (Standard)",
      });
      setAlertChannels({
        sms: user.alertChannels?.sms ?? true,
        whatsapp: user.alertChannels?.whatsapp ?? false,
      });
      setAlertThreshold(user.alertThreshold || "HIGH");
    }
  }, [user]);

  // Load weather for user's location
  useEffect(() => {
    if (user?.location) {
      setWeatherLoading(true);
      getCurrentHeat(user.location)
        .then((data) => setWeatherSnapshot(data))
        .catch(() => setWeatherSnapshot(null))
        .finally(() => setWeatherLoading(false));
    }
  }, [user?.location]);

  if (!user) return null;

  const initials = user.name
    ? user.name
        .split(" ")
        .map((p) => p[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  // Handle Profile Update
  async function handleProfileSubmit(e) {
    e.preventDefault();
    setProfileStatus(null);
    setProfileLoading(true);

    try {
      const updated = await updateProfile(profileForm);
      updateUser(updated);
      setProfileStatus({ type: "success", message: "Personal profile updated successfully." });
      setTimeout(() => setProfileStatus(null), 4000);
    } catch (err) {
      setProfileStatus({
        type: "error",
        message: err.response?.data?.message || "Failed to update profile. Please try again.",
      });
    } finally {
      setProfileLoading(false);
    }
  }

  // Handle Alerts Update
  async function handleAlertsSubmit(e) {
    e.preventDefault();
    setAlertsStatus(null);
    setAlertsLoading(true);

    try {
      const updated = await updateProfile({
        alertChannels,
        alertThreshold,
      });
      updateUser(updated);
      setAlertsStatus({ type: "success", message: "Early warning preferences saved." });
      setTimeout(() => setAlertsStatus(null), 4000);
    } catch (err) {
      setAlertsStatus({
        type: "error",
        message: err.response?.data?.message || "Failed to save alert preferences.",
      });
    } finally {
      setAlertsLoading(false);
    }
  }

  // Handle Test Alert
  async function handleSendTest() {
    setTestLoading(true);
    setTestError("");
    setTestResult(null);

    try {
      const res = await sendTestNotification({
        location: profileForm.location || user.location,
        severity: alertThreshold,
        channel: testChannel,
        to: profileForm.phone || user.phone,
      });
      setTestResult(res);
    } catch (err) {
      setTestError(err.response?.data?.message || "Failed to dispatch test notification.");
    } finally {
      setTestLoading(false);
    }
  }

  // Handle Password Update
  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setPasswordStatus(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordStatus({ type: "error", message: "New passwords do not match." });
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordStatus({ type: "error", message: "Password must be at least 6 characters long." });
      return;
    }

    setPasswordLoading(true);
    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordStatus({ type: "success", message: "Password changed successfully." });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setPasswordStatus(null), 4000);
    } catch (err) {
      setPasswordStatus({
        type: "error",
        message: err.response?.data?.message || "Failed to change password. Verify your current password.",
      });
    } finally {
      setPasswordLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-sun-50/50 pb-20">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {/* Profile Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl border border-ink-100 bg-white p-6 shadow-soft sm:p-8"
        >
          <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-sun-100/50 blur-2xl" />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-5">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-sun-600 to-sun-400 font-display text-2xl font-bold text-white shadow-md ring-4 ring-sun-100">
                {initials}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">{user.name}</h1>
                  <span className="rounded-full bg-sun-100 px-3 py-0.5 text-xs font-semibold text-sun-800">
                    {user.role === "admin" ? "District Administrator" : "Citizen User"}
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-ink-600">
                  <span className="flex items-center gap-1.5 font-medium text-ink-900">
                    <Phone size={15} className="text-sun-600" />
                    {user.phone || "No phone number added"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin size={15} className="text-sun-600" />
                    {user.location || "Lucknow"}
                  </span>
                  {user.email && (
                    <span className="flex items-center gap-1.5 text-ink-500">
                      <Mail size={15} className="text-ink-400" />
                      {user.email}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-ink-200 bg-white px-4 py-2 text-sm font-medium text-ink-700 transition hover:border-risk-extreme/30 hover:bg-risk-extreme/5 hover:text-risk-extreme"
              >
                <LogOut size={16} />
                <span>Sign out</span>
              </button>
            </div>
          </div>

          {/* Quick Stat Highlights */}
          <div className="mt-8 grid grid-cols-2 gap-3 border-t border-ink-100 pt-6 sm:grid-cols-4">
            <div className="rounded-2xl bg-sun-50/70 p-3.5">
              <p className="text-xs font-medium text-ink-400">Primary Contact</p>
              <p className="mt-1 font-semibold text-ink-900 truncate">{user.phone || "Unset"}</p>
            </div>
            <div className="rounded-2xl bg-sun-50/70 p-3.5">
              <p className="text-xs font-medium text-ink-400">Monitored Location</p>
              <p className="mt-1 font-semibold text-ink-900 truncate">{user.location || "Lucknow"}</p>
            </div>
            <div className="rounded-2xl bg-sun-50/70 p-3.5">
              <p className="text-xs font-medium text-ink-400">Active Alert Channels</p>
              <p className="mt-1 font-semibold text-sun-700">
                {[user.alertChannels?.sms && "SMS", user.alertChannels?.whatsapp && "WhatsApp"]
                  .filter(Boolean)
                  .join(" + ") || "None"}
              </p>
            </div>
            <div className="rounded-2xl bg-sun-50/70 p-3.5">
              <p className="text-xs font-medium text-ink-400">Alert Sensitivity</p>
              <p className="mt-1 font-semibold text-ink-900">{user.alertThreshold || "HIGH"}</p>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <div className="mt-8 flex overflow-x-auto border-b border-ink-100 pb-1">
          <div className="flex gap-2">
            {[
              { id: "profile", label: "Personal & City", icon: User },
              { id: "alerts", label: "Alert Channels & SMS", icon: Bell },
              { id: "security", label: "Security & Password", icon: Key },
              { id: "overview", label: "Location Heat Status", icon: Thermometer },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-sun-500 text-white shadow-sm"
                      : "text-ink-600 hover:bg-white hover:text-ink-900"
                  }`}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Contents */}
        <div className="mt-6">
          {/* TAB 1: Personal & City Profile */}
          {activeTab === "profile" && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-ink-100 bg-white p-6 shadow-soft sm:p-8"
            >
              <div>
                <h2 className="font-display text-xl font-semibold text-ink-900">Personal Information & Location</h2>
                <p className="mt-1 text-sm text-ink-600">
                  Update your contact details and monitored region. Your phone number is used for urgent SMS alerts.
                </p>
              </div>

              {profileStatus && (
                <div
                  className={`mt-6 flex items-center gap-2 rounded-2xl p-4 text-sm ${
                    profileStatus.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-red-50 text-red-800 border border-red-200"
                  }`}
                >
                  {profileStatus.type === "success" ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                  <span>{profileStatus.message}</span>
                </div>
              )}

              <form onSubmit={handleProfileSubmit} className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-ink-700">
                    <User size={15} className="text-sun-600" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-ink-100 px-4 py-3 text-ink-900 outline-none transition focus:border-sun-400 focus:ring-2 focus:ring-sun-200/50"
                  />
                </div>

                <div>
                  <label className="flex items-center justify-between text-sm font-medium text-ink-700">
                    <span className="flex items-center gap-1.5">
                      <Phone size={15} className="text-sun-600" />
                      Phone Number (Primary)
                    </span>
                    <span className="text-xs text-sun-700 font-medium">Used for SMS Alerts</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    placeholder="e.g. 6387978626"
                    className="mt-1.5 w-full rounded-xl border border-ink-100 px-4 py-3 text-ink-900 outline-none transition focus:border-sun-400 focus:ring-2 focus:ring-sun-200/50"
                  />
                  <p className="mt-1 text-xs text-ink-400">All emergency heatwave notifications are sent here.</p>
                </div>

                <div>
                  <label className="flex items-center justify-between text-sm font-medium text-ink-700">
                    <span className="flex items-center gap-1.5">
                      <Mail size={15} className="text-sun-600" />
                      Email Address
                    </span>
                    <span className="text-xs text-ink-400">Optional</span>
                  </label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    placeholder="e.g. user@example.com"
                    className="mt-1.5 w-full rounded-xl border border-ink-100 px-4 py-3 text-ink-900 outline-none transition focus:border-sun-400 focus:ring-2 focus:ring-sun-200/50"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-ink-700">
                    <MapPin size={15} className="text-sun-600" />
                    Monitored City / Region
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.location}
                    onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-ink-100 px-4 py-3 text-ink-900 outline-none transition focus:border-sun-400 focus:ring-2 focus:ring-sun-200/50"
                  />
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="text-xs text-ink-400">Quick select:</span>
                    {SUGGESTED_CITIES.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setProfileForm({ ...profileForm, location: c })}
                        className={`rounded-full px-2.5 py-0.5 text-xs transition ${
                          profileForm.location === c
                            ? "bg-sun-500 font-medium text-white"
                            : "bg-ink-100 text-ink-700 hover:bg-sun-100 hover:text-sun-800"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-ink-700">
                    <Shield size={15} className="text-sun-600" />
                    Occupational Heat Profile
                  </label>
                  <select
                    value={profileForm.occupation}
                    onChange={(e) => setProfileForm({ ...profileForm, occupation: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-ink-100 bg-white px-4 py-3 text-ink-900 outline-none transition focus:border-sun-400 focus:ring-2 focus:ring-sun-200/50"
                  >
                    {OCCUPATION_OPTIONS.map((occ) => (
                      <option key={occ} value={occ}>
                        {occ}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-ink-400">Tailors work-rest cycle advisories to your exposure.</p>
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-ink-700">
                    <Info size={15} className="text-sun-600" />
                    Heat Vulnerability Category
                  </label>
                  <select
                    value={profileForm.vulnerabilityCategory}
                    onChange={(e) => setProfileForm({ ...profileForm, vulnerabilityCategory: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-ink-100 bg-white px-4 py-3 text-ink-900 outline-none transition focus:border-sun-400 focus:ring-2 focus:ring-sun-200/50"
                  >
                    {VULNERABILITY_OPTIONS.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-ink-400">Assists AI in recommending hydration & medical safeguards.</p>
                </div>

                <div className="md:col-span-2 pt-2">
                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="inline-flex items-center gap-2 rounded-full bg-sun-500 px-6 py-3 font-medium text-white transition hover:bg-sun-600 disabled:opacity-60 shadow-sm"
                  >
                    {profileLoading ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" />
                        <span>Saving changes…</span>
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        <span>Save Profile</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* TAB 2: Alerts & Notification Channels */}
          {activeTab === "alerts" && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-6"
            >
              {/* Channel Preferences Card */}
              <div className="rounded-3xl border border-ink-100 bg-white p-6 shadow-soft sm:p-8">
                <div>
                  <h2 className="font-display text-xl font-semibold text-ink-900">
                    Early Warning Alert Preferences
                  </h2>
                  <p className="mt-1 text-sm text-ink-600">
                    Configure how and when SmartHeat AI notifies you regarding dangerous thermal stress levels.
                  </p>
                </div>

                {alertsStatus && (
                  <div
                    className={`mt-6 flex items-center gap-2 rounded-2xl p-4 text-sm ${
                      alertsStatus.type === "success"
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-red-50 text-red-800 border border-red-200"
                    }`}
                  >
                    {alertsStatus.type === "success" ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                    <span>{alertsStatus.message}</span>
                  </div>
                )}

                <form onSubmit={handleAlertsSubmit} className="mt-6 flex flex-col gap-6">
                  {/* SMS Channel Switch */}
                  <div className="flex items-start justify-between rounded-2xl border border-ink-100 p-5 transition hover:border-sun-300">
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sun-100 text-sun-700">
                        <Smartphone size={22} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-ink-900">SMS Mobile Alerts</p>
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                            Recommended
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-ink-600">
                          Dispatches urgent SMS warnings directly to{" "}
                          <span className="font-semibold text-ink-900">{profileForm.phone || user.phone}</span> when heat
                          indices cross critical thresholds.
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={alertChannels.sms}
                        onChange={(e) => setAlertChannels({ ...alertChannels, sms: e.target.checked })}
                        className="peer sr-only"
                      />
                      <div className="peer h-6 w-11 rounded-full bg-ink-200 peer-checked:bg-sun-500 peer-focus:outline-none after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                    </label>
                  </div>

                  {/* WhatsApp Channel Switch */}
                  <div className="flex items-start justify-between rounded-2xl border border-ink-100 p-5 transition hover:border-sun-300">
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                        <MessageSquare size={22} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-ink-900">WhatsApp Heatwave Advisories</p>
                        </div>
                        <p className="mt-1 text-sm text-ink-600">
                          Delivers daily morning briefings and structured IMD heat advisory cards via WhatsApp.
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={alertChannels.whatsapp}
                        onChange={(e) => setAlertChannels({ ...alertChannels, whatsapp: e.target.checked })}
                        className="peer sr-only"
                      />
                      <div className="peer h-6 w-11 rounded-full bg-ink-200 peer-checked:bg-emerald-600 peer-focus:outline-none after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                    </label>
                  </div>

                  {/* Trigger Severity Threshold */}
                  <div>
                    <label className="text-sm font-semibold text-ink-900">Alert Trigger Sensitivity</label>
                    <p className="mt-1 text-xs text-ink-500">
                      Choose the minimum heat risk severity that triggers an emergency alert to your phone.
                    </p>
                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                      {["MODERATE", "HIGH", "EXTREME"].map((level) => {
                        const info = THRESHOLD_DESCRIPTIONS[level];
                        const isSelected = alertThreshold === level;
                        return (
                          <button
                            key={level}
                            type="button"
                            onClick={() => setAlertThreshold(level)}
                            className={`flex flex-col text-left rounded-2xl border p-4 transition ${
                              isSelected
                                ? "border-sun-500 bg-sun-50/50 ring-2 ring-sun-400/40"
                                : "border-ink-100 bg-white hover:border-ink-200"
                            }`}
                          >
                            <span className={`inline-block w-fit rounded-full px-2.5 py-0.5 text-xs font-semibold ${info.color}`}>
                              {info.label}
                            </span>
                            <p className="mt-2 text-xs text-ink-600">{info.desc}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={alertsLoading}
                      className="inline-flex items-center gap-2 rounded-full bg-sun-500 px-6 py-3 font-medium text-white transition hover:bg-sun-600 disabled:opacity-60 shadow-sm"
                    >
                      {alertsLoading ? (
                        <>
                          <RefreshCw size={16} className="animate-spin" />
                          <span>Saving preferences…</span>
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          <span>Save Alert Settings</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Test Alert Dispatcher Card */}
              <div className="rounded-3xl border border-sun-200 bg-gradient-to-br from-sun-50/80 to-white p-6 shadow-soft sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-sun-200/70 px-3 py-0.5 text-xs font-semibold text-sun-800">
                      <Send size={13} /> Live System Test
                    </div>
                    <h3 className="mt-2 font-display text-lg font-semibold text-ink-900">
                      Send Test Alert to My Phone
                    </h3>
                    <p className="mt-1 text-sm text-ink-600">
                      Verify that your phone number <span className="font-semibold text-ink-900">{profileForm.phone || user.phone}</span> is properly connected to receive notifications.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={testChannel}
                      onChange={(e) => setTestChannel(e.target.value)}
                      className="rounded-xl border border-ink-100 bg-white px-3.5 py-2.5 text-sm font-medium text-ink-800 outline-none focus:border-sun-400"
                    >
                      <option value="SMS">SMS Test</option>
                      <option value="WHATSAPP">WhatsApp Test</option>
                    </select>

                    <button
                      type="button"
                      onClick={handleSendTest}
                      disabled={testLoading || !profileForm.phone}
                      className="inline-flex items-center gap-2 rounded-full bg-ink-900 px-5 py-2.5 text-sm font-medium text-sun-50 transition hover:bg-sun-600 disabled:opacity-50"
                    >
                      {testLoading ? (
                        <>
                          <RefreshCw size={15} className="animate-spin" />
                          <span>Dispatching…</span>
                        </>
                      ) : (
                        <>
                          <Send size={15} />
                          <span>Trigger Test Alert</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {testError && (
                  <div className="mt-4 rounded-xl border border-risk-extreme/20 bg-risk-extreme/10 p-4 text-sm text-risk-extreme">
                    {testError}
                  </div>
                )}

                {testResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
                        <CheckCircle2 size={16} className="text-emerald-600" />
                        {testResult.status === "SIMULATED_SENT" ? "Simulated Alert Dispatched" : "Live Alert Sent"}
                      </span>
                      <span className="text-xs text-ink-400">
                        {new Date(testResult.sentAt || Date.now()).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-medium text-ink-900">
                      Channel: <span className="font-semibold text-sun-700">{testResult.channel}</span> · Location: {testResult.location}
                    </p>
                    <div className="mt-2 rounded-xl bg-ink-50 p-3 font-mono text-xs text-ink-700 whitespace-pre-wrap">
                      {testResult.message}
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 3: Security & Password */}
          {activeTab === "security" && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-ink-100 bg-white p-6 shadow-soft sm:p-8"
            >
              <div>
                <h2 className="font-display text-xl font-semibold text-ink-900">Account Security</h2>
                <p className="mt-1 text-sm text-ink-600">
                  Manage your credentials and password for your phone-based account.
                </p>
              </div>

              {passwordStatus && (
                <div
                  className={`mt-6 flex items-center gap-2 rounded-2xl p-4 text-sm ${
                    passwordStatus.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-red-50 text-red-800 border border-red-200"
                  }`}
                >
                  {passwordStatus.type === "success" ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                  <span>{passwordStatus.message}</span>
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="mt-6 max-w-md flex flex-col gap-4">
                <div>
                  <label className="text-sm font-medium text-ink-700">Current Password</label>
                  <input
                    type="password"
                    required
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-ink-100 px-4 py-3 text-ink-900 outline-none transition focus:border-sun-400 focus:ring-2 focus:ring-sun-200/50"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-ink-700">New Password (min 6 characters)</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-ink-100 px-4 py-3 text-ink-900 outline-none transition focus:border-sun-400 focus:ring-2 focus:ring-sun-200/50"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-ink-700">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-ink-100 px-4 py-3 text-ink-900 outline-none transition focus:border-sun-400 focus:ring-2 focus:ring-sun-200/50"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="inline-flex items-center gap-2 rounded-full bg-sun-500 px-6 py-3 font-medium text-white transition hover:bg-sun-600 disabled:opacity-60 shadow-sm"
                  >
                    {passwordLoading ? "Updating password…" : "Change Password"}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* TAB 4: Location Heat Overview */}
          {activeTab === "overview" && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-ink-100 bg-white p-6 shadow-soft sm:p-8"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="font-display text-xl font-semibold text-ink-900">
                    Live Heat Snapshot: {user.location}
                  </h2>
                  <p className="mt-1 text-sm text-ink-600">
                    Current atmospheric thermal risk metrics monitored for your profile location.
                  </p>
                </div>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-sun-700 hover:text-sun-800"
                >
                  <span>Go to Full Dashboard</span>
                  <ArrowRight size={15} />
                </Link>
              </div>

              {weatherLoading ? (
                <div className="mt-8 flex items-center justify-center py-12 text-ink-400">
                  <RefreshCw size={24} className="animate-spin text-sun-500" />
                  <span className="ml-3 text-sm">Fetching thermal sensor data…</span>
                </div>
              ) : weatherSnapshot ? (
                <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div className="rounded-2xl border border-ink-100 bg-sun-50/50 p-5">
                    <p className="text-xs text-ink-500">Air Temperature</p>
                    <p className="mt-2 font-display text-3xl font-bold text-ink-900">
                      {weatherSnapshot.temperature}°C
                    </p>
                    <p className="mt-1 text-xs text-ink-400">Feels like {weatherSnapshot.feelsLike}°C</p>
                  </div>

                  <div className="rounded-2xl border border-ink-100 bg-sun-50/50 p-5">
                    <p className="text-xs text-ink-500">Relative Humidity</p>
                    <p className="mt-2 font-display text-3xl font-bold text-sky-700">
                      {weatherSnapshot.humidity}%
                    </p>
                    <p className="mt-1 text-xs text-ink-400">Wind: {weatherSnapshot.windSpeed} km/h</p>
                  </div>

                  <div className="rounded-2xl border border-ink-100 bg-sun-50/50 p-5">
                    <p className="text-xs text-ink-500">UV Radiation Index</p>
                    <p className="mt-2 font-display text-3xl font-bold text-amber-600">
                      {weatherSnapshot.uvIndex ?? "6.2"}
                    </p>
                    <p className="mt-1 text-xs text-ink-400">Solar: {weatherSnapshot.solarRadiation ?? "480"} W/m²</p>
                  </div>

                  <div className="rounded-2xl border border-ink-100 bg-sun-50/50 p-5">
                    <p className="text-xs text-ink-500">Monitoring Station</p>
                    <p className="mt-2 font-display text-lg font-bold text-ink-900 truncate">
                      {weatherSnapshot.location || user.location}
                    </p>
                    <span className="mt-1 inline-block rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                      Live IMD Stream
                    </span>
                  </div>
                </div>
              ) : (
                <div className="mt-8 rounded-2xl bg-sun-50 p-6 text-center text-sm text-ink-600">
                  Could not retrieve current weather metrics for {user.location}. Verify network or city spelling in your profile.
                </div>
              )}

              <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-ink-100 pt-6">
                <Link
                  to="/forecast"
                  className="rounded-full bg-sun-100 px-4 py-2 text-sm font-medium text-sun-800 transition hover:bg-sun-200"
                >
                  View 5-Day Heatwave Forecast
                </Link>
                <Link
                  to="/risk-map"
                  className="rounded-full border border-ink-100 px-4 py-2 text-sm font-medium text-ink-700 transition hover:bg-ink-50"
                >
                  Open National Heat Risk Map
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
