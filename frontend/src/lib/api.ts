import axios from "axios";

const api = axios.create({
  // Use environment variable for production, fallback to localhost for development
  baseURL: import.meta.env.VITE_API_URL || 'https://real-estate-crm-backend-e5ep.onrender.com/api',
});

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  
  failedQueue = [];
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Enhanced response interceptor with automatic token refresh
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue the request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("refresh");
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        const response = await axios.post("/api/auth/refresh/", {
          refresh: refreshToken,
        });

        const { access, refresh: newRefreshToken } = response.data;
        
        localStorage.setItem("access", access);
        localStorage.setItem("refresh", newRefreshToken);
        
        // Update the original request with new token
        originalRequest.headers.Authorization = `Bearer ${access}`;
        
        // Process queued requests
        processQueue(null, access);
        
        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        processQueue(refreshError, null);
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        
        // Only redirect if not already on login page and not during form submission
        if (window.location.pathname !== "/login" && !originalRequest.url?.includes('/leads/')) {
          console.log("Token refresh failed, redirecting to login...");
          window.location.href = "/login";
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
