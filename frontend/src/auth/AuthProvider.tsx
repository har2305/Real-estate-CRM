import React, { useState, useEffect } from "react";
import api from "../lib/api";
import { AuthContext } from "./AuthContext";
import type { AuthContextType } from "./AuthContext";

interface Props {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<Props> = ({ children }) => {
  const [user, setUser] = useState<AuthContextType["user"]>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("access")
  );
  const [initializing, setInitializing] = useState(true);
  const [inactivityTimer, setInactivityTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [refreshTimer, setRefreshTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const INACTIVITY_TIMEOUT = 60 * 60 * 1000; // 60 minutes (1 hour) - much more reasonable
  const TOKEN_REFRESH_INTERVAL = 23 * 60 * 60 * 1000; // 23 hours (refresh before 24h expiry)

  useEffect(() => {
    if (token) {
      localStorage.setItem("access", token);
      (async () => {
        try {
          const res = await api.get("/auth/me/");
          setUser(res.data);
          startInactivityTimer();
          scheduleTokenRefresh();
        } catch {
          setUser(null);
          clearInactivityTimer();
          clearRefreshTimer();
        } finally {
          setInitializing(false);
        }
      })();
    } else {
      localStorage.removeItem("access");
      clearInactivityTimer();
      setInitializing(false);
    }
  }, [token]);

  const startInactivityTimer = () => {
    // Clear any existing timer first
    clearInactivityTimer();
    
    const timer = setTimeout(() => {
      // Only logout if user is still logged in and no recent activity
      if (token && user) {
        console.log("User inactive for 1 hour, logging out...");
        logout();
      }
    }, INACTIVITY_TIMEOUT);
    
    setInactivityTimer(timer);
  };

  const clearInactivityTimer = () => {
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
      setInactivityTimer(null);
    }
  };

  const clearRefreshTimer = () => {
    if (refreshTimer) {
      clearTimeout(refreshTimer);
      setRefreshTimer(null);
    }
  };

  const refreshToken = async () => {
    try {
      const refreshTokenValue = localStorage.getItem("refresh");
      if (!refreshTokenValue) {
        throw new Error("No refresh token available");
      }

      const response = await api.post("/auth/refresh/", {
        refresh: refreshTokenValue,
      });

      const newAccessToken = response.data.access;
      const newRefreshToken = response.data.refresh;

      setToken(newAccessToken);
      localStorage.setItem("access", newAccessToken);
      localStorage.setItem("refresh", newRefreshToken);

      // Schedule next refresh
      scheduleTokenRefresh();
      
      console.log("Token refreshed successfully");
    } catch (error) {
      console.error("Token refresh failed:", error);
      // Only logout if we're not in the middle of a form submission
      if (!window.location.pathname.includes('/leads/') && !window.location.pathname.includes('/add')) {
        logout();
      } else {
        console.log("Skipping logout during form submission");
      }
    }
  };

  const scheduleTokenRefresh = () => {
    clearRefreshTimer();
    const timer = setTimeout(() => {
      refreshToken();
    }, TOKEN_REFRESH_INTERVAL);
    setRefreshTimer(timer);
  };

  const resetInactivityTimer = () => {
    // Only reset timer if user is logged in
    if (token && user) {
      console.log("User activity detected, resetting inactivity timer");
      startInactivityTimer();
    }
  };

  // Set up activity listeners to reset inactivity timer
  useEffect(() => {
    if (!token || !user) return;

    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    const handleUserActivity = () => resetInactivityTimer();

    // Add event listeners for user activity
    activityEvents.forEach(event => {
      document.addEventListener(event, handleUserActivity, true);
    });

    // Cleanup event listeners on unmount
    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleUserActivity, true);
      });
    };
  }, [token, user]);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post("/auth/login/", { email, password });
      const { access, refresh, user } = response.data;
      setToken(access);
      setUser(user);
      localStorage.setItem("access", access);
      if (refresh) localStorage.setItem("refresh", refresh);
      startInactivityTimer();
      scheduleTokenRefresh();
    } catch (error) {
      console.error("Login failed:", error);
      // Don't logout on login failure, just throw the error
      throw error;
    }
  };

  const register = async (email: string, password: string, first_name?: string, last_name?: string) => {
    try {
      const response = await api.post("/auth/register/", { 
        email, 
        password, 
        first_name: first_name || '', 
        last_name: last_name || '' 
      });
      const { access, refresh, user } = response.data;
      setToken(access);
      setUser(user);
      localStorage.setItem("access", access);
      if (refresh) localStorage.setItem("refresh", refresh);
      startInactivityTimer();
      scheduleTokenRefresh();
    } catch (error) {
      console.error("Registration failed:", error);
      // Don't logout on registration failure, just throw the error
      throw error;
    }
  };

  const updateUser = async () => {
    if (!token) return;
    try {
      const response = await api.get("/auth/me/");
      setUser(response.data);
    } catch (error) {
      console.error('Failed to update user data:', error);
    }
  };

  const logout = () => {
    // Check if user is actively working on a form
    const activeForm = document.querySelector('form:focus-within') || 
                      document.querySelector('input:focus') || 
                      document.querySelector('textarea:focus');
    
    if (activeForm) {
      console.log("User is actively working on a form, skipping logout");
      return;
    }

    console.log("Logging out user...");
    setUser(null);
    setToken(null);
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    clearInactivityTimer();
    clearRefreshTimer();
  };

  return (
    <AuthContext.Provider value={{ user, token, initializing, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
