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
  const [inactivityTimer, setInactivityTimer] = useState<NodeJS.Timeout | null>(null);

  const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutes

  useEffect(() => {
    if (token) {
      localStorage.setItem("access", token);
      (async () => {
        try {
          const res = await api.get("/auth/me/");
          setUser(res.data);
          startInactivityTimer();
        } catch {
          setUser(null);
          clearInactivityTimer();
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
    clearInactivityTimer();
    const timer = setTimeout(() => {
      logout();
    }, INACTIVITY_TIMEOUT);
    setInactivityTimer(timer);
  };

  const clearInactivityTimer = () => {
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
      setInactivityTimer(null);
    }
  };

  const resetInactivityTimer = () => {
    if (token && user) {
      startInactivityTimer();
    }
  };

  // Listen for user activity
  useEffect(() => {
    if (!token || !user) return;

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    const resetTimer = () => resetInactivityTimer();

    events.forEach(event => {
      document.addEventListener(event, resetTimer, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetTimer, true);
      });
    };
  }, [token, user]);

  const login = async (email: string, password: string) => {
    const response = await api.post("/auth/login/", { email, password });
    const { access, refresh, user } = response.data;
    setToken(access);
    setUser(user);
    localStorage.setItem("access", access);
    if (refresh) localStorage.setItem("refresh", refresh);
    startInactivityTimer();
  };

  const register = async (email: string, password: string) => {
    const response = await api.post("/auth/register/", { email, password });
    const { access, refresh, user } = response.data;
    setToken(access);
    setUser(user);
    localStorage.setItem("access", access);
    if (refresh) localStorage.setItem("refresh", refresh);
    startInactivityTimer();
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    clearInactivityTimer();
  };

  return (
    <AuthContext.Provider value={{ user, token, initializing, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
