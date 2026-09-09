"use client";

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { getToken, getUser, setUser, clearAuth } from "@/lib/auth";

export interface UserProfile {
  users_id?: number;
  users_uuid?: string;
  users_email?: string;
  users_user_name?: string;
  users_status?: number;
  users_create_date?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => { },
  refreshUser: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUserState] = useState<UserProfile | null>(() => getUser<UserProfile>());
  const [loading, setLoading] = useState<boolean>(true);
  const fetchedRef = useRef<boolean>(false);

  const fetchProfile = async () => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      router.push("/login");
      return;
    }

    try {
      const res = await api.get("/api/auth/me");
      if (res.data?.success && res.data?.data) {
        setUserState(res.data.data);
        setUser(res.data.data);
      }
    } catch {
      clearAuth();
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Prevent double-fetching in React 18/19 StrictMode (dev mode)
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    fetchProfile();
  }, []);

  const logout = async () => {
    try {
      await api.post("/api/auth/logout");
    } catch {
      // Proceed even if network error
    } finally {
      clearAuth();
      setUserState(null);
      router.push("/login");
    }
  };

  const refreshUser = async () => {
    await fetchProfile();
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
