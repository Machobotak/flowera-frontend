"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

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
  user: User | null;
  login: (email?: string, password?: string) => Promise<void>;
  register: (name: string, username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

/* ──────────────────────────── Helper ──────────────────────────── */

const getDisplayNameFromEmail = (email: string) => {
  const prefix = email.split("@")[0];
  return prefix
    .split(/[._-]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const ELEANOR_AVATAR =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD74GXDH79_rfkCVsJ-l1nXPVWlZUhIT1hqT9lB3b5djBCPy5Ypm0oxQfIbLe2O15468KR-YTyXqj01viOvQrvrYWCH_zRwMBjNcWI6tSat3K6XAVWCLRWj1yMq-Pi3JL9S9cWIvGMnKAjl4AjYQRVih9GT-ut6-AMprXZCT3wr6PGFJJFplmOcTHJe-xvqWZPbfWmKG_beX5_2s2yktjUiHaTT-lrfRiZK5pw4riXjfXq0_K0a9EfRhy_wVwCk_gJ0p1uHtXHQjCY";

const buildUser = (name: string, email: string): User => {
  const isEleanor = email.toLowerCase() === "eleanor.vance@email.com";
  const avatar = isEleanor
    ? ELEANOR_AVATAR
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1F4D2E&color=fff`;

  return {
    id: 0,
    email,
    name,
    avatar,
    memberLabel: isEleanor ? "Premium Member" : "Member",
  };
};

/* ──────────────────────────── Context ──────────────────────────── */

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  user: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

/* ──────────────────────────── Provider ──────────────────────────── */

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);

  // Read auth state from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("user");
      }
    }
    setMounted(true);
  }, []);

  const login = useCallback(async (email?: string, password?: string) => {
    try {
      await axios.post("http://localhost:3000/api/auth/login", {
        email,
        password,
      });

      const name = getDisplayNameFromEmail(email || "");
      const newUser = buildUser(name, email || "");

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
      await axios.post("http://localhost:3000/api/auth/register", {
        name,
        username,
        email,
        password,
      });

      const newUser = buildUser(name, email);

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
    axios.post("http://localhost:3000/api/auth/logout").catch(() => {});
  }, []);

  const value: AuthContextType = {
    isLoggedIn: mounted ? !!user : false,
    user: mounted ? user : null,
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
