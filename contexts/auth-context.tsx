"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

/* ──────────────────────────── Types ──────────────────────────── */

interface User {
  name: string;
  avatar: string;
  memberLabel?: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  login: () => void;
  logout: () => void;
}

/* ──────────────────────────── Demo User ──────────────────────────── */

const DEMO_USER: User = {
  name: "Eleanor Vance",
  avatar:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuD74GXDH79_rfkCVsJ-l1nXPVWlZUhIT1hqT9lB3b5djBCPy5Ypm0oxQfIbLe2O15468KR-YTyXqj01viOvQrvrYWCH_zRwMBjNcWI6tSat3K6XAVWCLRWj1yMq-Pi3JL9S9cWIvGMnKAjl4AjYQRVih9GT-ut6-AMprXZCT3wr6PGFJJFplmOcTHJe-xvqWZPbfWmKG_beX5_2s2yktjUiHaTT-lrfRiZK5pw4riXjfXq0_K0a9EfRhy_wVwCk_gJ0p1uHtXHQjCY",
  memberLabel: "Premium Member",
};

/* ──────────────────────────── Context ──────────────────────────── */

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  user: null,
  login: () => {},
  logout: () => {},
});

/* ──────────────────────────── Provider ──────────────────────────── */

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Read auth state from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("flowera_auth");
    if (stored === "true") {
      setIsLoggedIn(true);
    }
    setMounted(true);
  }, []);

  const login = useCallback(() => {
    setIsLoggedIn(true);
    localStorage.setItem("flowera_auth", "true");
  }, []);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    localStorage.removeItem("flowera_auth");
  }, []);

  // Prevent hydration mismatch — render children only after mount
  const value: AuthContextType = {
    isLoggedIn: mounted ? isLoggedIn : false,
    user: mounted && isLoggedIn ? DEMO_USER : null,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/* ──────────────────────────── Hook ──────────────────────────── */

export function useAuth() {
  return useContext(AuthContext);
}
