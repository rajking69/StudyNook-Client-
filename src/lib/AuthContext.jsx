"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { authClient } from "@/lib/auth-client";
import api from "@/lib/api";
import { clearCachedBetterAuthJwt } from "@/lib/syncExpressSession";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const response = await api.get("/auth/me", {
        validateStatus: (status) => status === 200 || status === 401,
      });
      if (response.status === 401) {
        setUser(null);
        return null;
      }
      setUser(response.data);
      return response.data;
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, [refreshUser]);

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      /* still clear local session */
    }
    try {
      await authClient.signOut();
    } catch (err) {
      console.warn("Better Auth signOut:", err?.message || err);
    }
    clearCachedBetterAuthJwt();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, loading, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
