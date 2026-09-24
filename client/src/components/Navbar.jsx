import React, { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Flame, Menu, X, User, Phone, MapPin, LogOut, ChevronDown, Bell, Shield } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const links = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/forecast", label: "Forecast" },
  { to: "/risk-map", label: "Risk map" },
  { to: "/alerts", label: "Alerts" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((p) => p[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <header className="sticky top-0 z-40 border-b border-ink-100/70 bg-sun-50/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sun-500 text-sun-50 shadow-sm">
            <Flame size={18} strokeWidth={2.4} />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight text-ink-900">SmartHeat AI</span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `text-[15px] transition-colors ${isActive ? "text-sun-700 font-medium" : "text-ink-600 hover:text-ink-900"}`
              }
            >
              {l.label}
            </NavLink>
          ))}
          {user?.role === "admin" && (
            <NavLink to="/admin" className={({ isActive }) => `text-[15px] ${isActive ? "text-sun-700 font-medium" : "text-ink-600 hover:text-ink-900"}`}>
              Admin
            </NavLink>
          )}
        </nav>

        {/* Desktop User Section */}
        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileDropdownOpen((v) => !v)}
                className="flex items-center gap-2.5 rounded-full border border-ink-100 bg-white py-1.5 pl-2 pr-3.5 text-sm transition hover:border-sun-300 hover:shadow-sm"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-sun-600 to-sun-400 text-xs font-bold text-white">
                  {initials}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-semibold leading-tight text-ink-900">{user.name?.split(" ")[0]}</span>
                  <span className="text-[10px] leading-tight text-ink-400">{user.location || "Lucknow"}</span>
                </div>
                <ChevronDown size={14} className="text-ink-400" />
              </button>

              {/* Profile Dropdown Menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-ink-100 bg-white p-2 shadow-soft">
                  <div className="border-b border-ink-100 px-3 py-2.5">
                    <p className="text-sm font-semibold text-ink-900">{user.name}</p>
                    {user.phone && (
                      <p className="mt-0.5 flex items-center gap-1.5 text-xs font-medium text-sun-700">
                        <Phone size={11} /> {user.phone}
                      </p>
                    )}
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-400">
                      <MapPin size={11} /> {user.location}
                    </p>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-ink-700 hover:bg-sun-50 hover:text-sun-800"
                    >
                      <User size={15} className="text-sun-600" />
                      <span>User Profile & Settings</span>
                    </Link>

                    <Link
                      to="/alerts"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-ink-700 hover:bg-sun-50 hover:text-sun-800"
                    >
                      <Bell size={15} className="text-sun-600" />
                      <span>Early Warning Alerts</span>
                    </Link>

                    {user.role === "admin" && (
                      <Link
                        to="/admin"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-ink-700 hover:bg-sun-50 hover:text-sun-800"
                      >
                        <Shield size={15} className="text-sun-600" />
                        <span>Admin Console</span>
                      </Link>
                    )}
                  </div>

                  <div className="border-t border-ink-100 pt-1">
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        logout();
                        navigate("/");
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm text-risk-extreme hover:bg-risk-extreme/5"
                    >
                      <LogOut size={15} />
                      <span>Sign out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="text-[15px] text-ink-600 hover:text-ink-900">Sign in</Link>
              <Link to="/register" className="rounded-full bg-ink-900 px-4 py-2 text-sm font-medium text-sun-50 transition hover:bg-sun-600">
                Get started
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {open && (
        <div className="border-t border-ink-100/70 bg-sun-50 px-5 py-4 md:hidden">
          {user && (
            <div className="mb-4 flex items-center justify-between rounded-2xl border border-ink-100 bg-white p-3.5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-sun-600 to-sun-400 font-bold text-white">
                  {initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink-900">{user.name}</p>
                  <p className="flex items-center gap-1 text-xs text-sun-700 font-medium">
                    <Phone size={11} /> {user.phone || "No phone"}
                  </p>
                </div>
              </div>
              <Link
                to="/profile"
                onClick={() => setOpen(false)}
                className="rounded-full bg-sun-100 px-3 py-1 text-xs font-semibold text-sun-800"
              >
                Profile
              </Link>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)} className="py-1 text-ink-700 font-medium">
                {l.label}
              </NavLink>
            ))}
            {user?.role === "admin" && (
              <NavLink to="/admin" onClick={() => setOpen(false)} className="py-1 text-ink-700 font-medium">
                Admin Console
              </NavLink>
            )}

            {user ? (
              <button
                onClick={() => {
                  logout();
                  setOpen(false);
                  navigate("/");
                }}
                className="mt-2 flex items-center gap-2 py-1 text-left text-sm font-medium text-risk-extreme"
              >
                <LogOut size={16} />
                <span>Sign out</span>
              </button>
            ) : (
              <div className="mt-2 flex flex-col gap-2 pt-2 border-t border-ink-100">
                <Link to="/login" onClick={() => setOpen(false)} className="text-ink-700 py-1">
                  Sign in
                </Link>
                <Link
                  to="/register"
                  onClick={() => setOpen(false)}
                  className="rounded-full bg-sun-500 py-2.5 text-center text-sm font-medium text-white shadow-sm"
                >
                  Create account
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
