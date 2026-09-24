import api from "./api.js";

export const getNotifications = () => api.get("/notifications").then((r) => r.data.data);
export const sendTestNotification = (payload) => api.post("/notifications/test", payload).then((r) => r.data.data);
