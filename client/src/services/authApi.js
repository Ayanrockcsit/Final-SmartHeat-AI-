import api from "./api.js";

export const registerUser = (payload) => api.post("/auth/register", payload).then((r) => r.data);
export const loginUser = (payload) => api.post("/auth/login", payload).then((r) => r.data);
export const getMe = () => api.get("/auth/me").then((r) => r.data.user);
export const updateProfile = (payload) => api.put("/auth/profile", payload).then((r) => r.data.user);
export const changePassword = (payload) => api.put("/auth/change-password", payload).then((r) => r.data);
