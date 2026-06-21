"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

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
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

/* ──────────────────────────── Helper ──────────────────────────── */

const decodeJwt = (token: string) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

const getDisplayNameFromEmail = (email: string) => {
  const prefix = email.split("@")[0];
  return prefix
    .split(/[._-]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const getUserFromToken = (token: string): User | null => {
  const decoded = decodeJwt(token);
  if (!decoded || !decoded.email || !decoded.sub) return null;

  const email = decoded.email;
  const name = getDisplayNameFromEmail(email);

  // If it's Eleanor Vance, use the premium avatar and label for premium experience
  const isEleanor = email.toLowerCase() === "eleanor.vance@email.com";
  const avatar = isEleanor
    ? "https://lh3.googleusercontent.com/aida-public/AB6AXuD74GXDH79_rfkCVsJ-l1nXPVWlZUhIT1hqT9lB3b5djBCPy5Ypm0oxQfIbLe2O15468KR-YTyXqj01viOvQrvrYWCH_zRwMBjNcWI6tSat3K6XAVWCLRWj1yMq-Pi3JL9S9cWIvGMnKAjl4AjYQRVih9GT-ut6-AMprXZCT3wr6PGFJJFplmOcTHJe-xvqWZPbfWmKG_beX5_2s2yktjUiHaTT-lrfRiZK5pw4riXjfXq0_K0a9EfRhy_wVwCk_gJ0p1uHtXHQjCY"
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1F4D2E&color=fff`;

  return {
    id: decoded.sub,
    email: email,
    name: name,
    avatar: avatar,
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
    const token = localStorage.getItem("accessToken");
    if (token) {
      const parsedUser = getUserFromToken(token);
      if (parsedUser) {
        setUser(parsedUser);
      } else {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      }
    }
    setMounted(true);
  }, []);

  const login = useCallback(async (email?: string, password?: string) => {
    try {
      const response = await axios.post("http://localhost:3000/auth/login", {
        email,
        password,
      });

      const { accessToken, refreshToken } = response.data;
      
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      const parsedUser = getUserFromToken(accessToken);
      if (parsedUser) {
        setUser(parsedUser);
      } else {
        throw new Error("Token payload tidak valid");
      }
    } catch (error: any) {
      // Propagate error to login page
      if (error.response && error.response.data && error.response.data.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    try {
      const emailPrefix = email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const username = `${emailPrefix}_${randomSuffix}`;

      const response = await axios.post("http://localhost:3000/auth/register", {
        name,
        username,
        email,
        password,
      });

      const { accessToken, refreshToken } = response.data;
      
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      const parsedUser = getUserFromToken(accessToken);
      if (parsedUser) {
        setUser(parsedUser);
      } else {
        throw new Error("Token payload tidak valid");
      }
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
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
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

