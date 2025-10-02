import axios from "axios";

const api = axios.create({
  // Force proxy usage to avoid host mismatches (127.0.0.1 vs localhost)
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// NEW: uniform error mapping + auto sign-out on 401
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("access");
      // optional: location redirect (keeps it lib-only)
      // window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
