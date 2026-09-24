import React, { createContext, useContext, useEffect, useState } from "react";
import { getMe } from "../services/authApi.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("smartheat_token");
    if (!token) {
      setLoading(false);
      return;
    }
    getMe()
      .then(setUser)
      .catch(() => localStorage.removeItem("smartheat_token"))
      .finally(() => setLoading(false));
  }, []);

  function login(token, userData) {
    localStorage.setItem("smartheat_token", token);
    setUser(userData);
  }

  function updateUser(userData) {
    setUser((prev) => ({ ...prev, ...userData }));
  }

  function logout() {
    localStorage.removeItem("smartheat_token");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
