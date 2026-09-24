import api from "./api.js";

export const getAdminDashboard = () => api.get("/admin/dashboard").then((r) => r.data.data);
export const getAdminAlerts = () => api.get("/admin/alerts").then((r) => r.data.data);
export const getAdminNotifications = () => api.get("/admin/notifications").then((r) => r.data.data);
