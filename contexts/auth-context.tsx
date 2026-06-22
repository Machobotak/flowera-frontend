"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

/* ──────────────────────────── Config ──────────────────────────── */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

axios.defaults.withCredentials = true;

/* ──────────────────────────── Types ──────────────────────────── */

interface User {
  id: number;
  email: string;
  name: string;
  avatar: string;
  memberLabel?: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  isLoading: boolean;
  user: User | null;
  login: (email?: string, password?: string) => Promise<void>;
  register: (name: string, username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

/* ──────────────────────────── Helper ──────────────────────────── */

const buildUser = (data: { id?: number; name: string; email: string; avatar?: string; memberLabel?: string }): User => {
  const avatar = data.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=1F4D2E&color=fff`;
  return {
    id: data.id || 0,
    email: data.email,
    name: data.name,
    avatar,
    memberLabel: data.memberLabel || "Member",
  };
};

/* ──────────────────────────── Context ──────────────────────────── */

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  isLoading: true,
  user: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

/* ──────────────────────────── Provider ──────────────────────────── */

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Validate session on mount by calling the backend
  useEffect(() => {
    const validateSession = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/auth/me`);
        if (res.data && res.data.user) {
          const validatedUser = buildUser(res.data.user);
          localStorage.setItem("user", JSON.stringify(validatedUser));
          setUser(validatedUser);
        } else {
          // Server says no valid session — clear local state
          localStorage.removeItem("user");
          setUser(null);
        }
      } catch {
        // Session invalid or server unreachable — fallback to localStorage cache
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
          try {
            setUser(JSON.parse(savedUser));
          } catch {
            localStorage.removeItem("user");
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    validateSession();
  }, []);

  const login = useCallback(async (email?: string, password?: string) => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password,
      });

      // Use user data from server response if available
      const userData = res.data?.user;
      const newUser = userData
        ? buildUser(userData)
        : buildUser({ name: email?.split("@")[0] || "", email: email || "" });

      localStorage.setItem("user", JSON.stringify(newUser));
      setUser(newUser);
    } catch (error: any) {
      // Propagate error to login page
      if (error.response && error.response.data && error.response.data.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  }, []);

  const register = useCallback(async (name: string, username: string, email: string, password: string) => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/register`, {
        name,
        username,
        email,
        password,
      });

      // Use user data from server response if available
      const userData = res.data?.user;
      const newUser = userData ? buildUser(userData) : buildUser({ name, email });

      localStorage.setItem("user", JSON.stringify(newUser));
      setUser(newUser);
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.message) {
        const msg = Array.isArray(error.response.data.message)
          ? error.response.data.message.join(", ")
          : error.response.data.message;
        throw new Error(msg);
      }
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("user");
    // Fire-and-forget logout request to clear server-side session/cookies
    axios.post(`${API_URL}/api/auth/logout`).catch(() => {});
  }, []);

  const value: AuthContextType = {
    isLoggedIn: !isLoading && !!user,
    isLoading,
    user: isLoading ? null : user,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/* ──────────────────────────── Hook ──────────────────────────── */

export function useAuth() {
  return useContext(AuthContext);
}
