import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Redirect to login on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  },
);

// ── Auth ─────────────────────────────────────────
export const authAPI = {
  signup: (data) => api.post("/api/auth/signup", data),
  login: (data) => api.post("/api/auth/login", data),
};

// ── Projects ────────────────────────────────────
export const projectAPI = {
  create: (data) => api.post("/api/projects/", data),
  list: () => api.get("/api/projects/"),
  get: (id) => api.get(`/api/projects/${id}`),
  delete: (id) => api.delete(`/api/projects/${id}`),
};

// ── Analysis ────────────────────────────────────
export const analysisAPI = {
  analyze: (projectId) => api.post(`/api/analysis/analyze/${projectId}`),
  get: (projectId) => api.get(`/api/analysis/${projectId}`),
};

// ── Viva ────────────────────────────────────────
export const vivaAPI = {
  start: (data) => api.post("/api/viva/start", data),
  answer: (data) => api.post("/api/viva/answer", data),
  getSession: (id) => api.get(`/api/viva/session/${id}`),
  history: (projectId) => api.get(`/api/viva/history/${projectId}`),
};

// ── Report ──────────────────────────────────────
export const reportAPI = {
  download: (projectId) =>
    api.get(`/api/report/${projectId}`, { responseType: "blob" }),
};

export default api;
