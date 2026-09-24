import api from "./api.js";

export const getRecommendation = (payload) => api.post("/ai/recommendation", payload).then((r) => r.data.data);
