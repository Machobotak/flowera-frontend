"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

/* ──────────────────────────── Config ──────────────────────────── */

const API_URL = "";

axios.defaults.withCredentials = true;

/* ──────────────────────────── Types ──────────────────────────── */

interface User {
  id: number;
  email: string;
  name: string;
  avatar: string;
  memberLabel?: string;
  roles: string[];
}

interface AuthContextType {
  isLoggedIn: boolean;
  isLoading: boolean;
  user: User | null;
  login: (email?: string, password?: string) => Promise<void>;
  register: (name: string, phone_number: string, email: string, password: string) => Promise<void>;
  googleLogin: () => void;
  logout: () => Promise<void>;
}

/* ──────────────────────────── Helper ──────────────────────────── */

const buildUser = (
  data?: {
    id?: number;
    name?: string;
    email?: string;
    avatar?: string;
    memberLabel?: string;
    roles?: string[];
  }
): User => {
  if (!data) {
    throw new Error(
      "User data is missing"
    );
  }

  const avatar =
    data.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      data.name || "User"
    )}&background=1F4D2E&color=fff`;

  return {
    id: data.id || 0,
    email: data.email || "",
    name: data.name || "",
    avatar,
    memberLabel:
      data.memberLabel || "Member",
    roles: data.roles || ["user"],
  };
};

/* ──────────────────────────── Context ──────────────────────────── */

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  isLoading: true,
  user: null,
  login: async () => {},
  register: async () => {},
  googleLogin() {},
  logout: async () => {},
});

/* ──────────────────────────── Provider ──────────────────────────── */

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Validate session on mount by calling the backend
  useEffect(() => {
    const validateSession = async () => {
      try {
        const token = localStorage.getItem("accessToken");

        // Try with token from localStorage first, fallback to cookie-based auth
        const res = await axios.get(`${API_URL}/api/auth/me`, {
          ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
        });

        if (res.data) {
          const validatedUser = buildUser(res.data);

          // Set default header for future requests if we have a token
          if (token) {
            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          }

          localStorage.setItem(
            "user",
            JSON.stringify(validatedUser)
          );

          setUser(validatedUser);
        } else {
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

  const handleGoogleLogin = () => {
    window.location.href =
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`;
  };

  const login = useCallback(
    async (email?: string, password?: string) => {
      try {
        const res = await axios.post(
          `${API_URL}/api/auth/login`,
          {
            email,
            password,
          }
        );

        localStorage.setItem(
          "accessToken",
          res.data.accessToken
        );

        localStorage.setItem(
          "refreshToken",
          res.data.refreshToken
        );
        
        axios.defaults.headers.common["Authorization"] = `Bearer ${res.data.accessToken}`;

        const me = await axios.get(
          `${API_URL}/api/auth/me`
        );


        const newUser = buildUser(
          me.data
        );

        localStorage.setItem(
          "user",
          JSON.stringify(newUser)
        );

        setUser(newUser);
      } catch (error: any) {
        const message =
          error.response?.data?.message ||
          error.message ||
          "Login failed";

        throw new Error(message);
      }
    },
    []
  );


  const register = useCallback(
    async (
      name: string,
      phone_number: string,
      email: string,
      password: string
    ) => {
      try {
        const res = await axios.post(
          `${API_URL}/api/auth/register`,
          {
            name,
            phone_number,
            email,
            password,
          }
        );

        localStorage.setItem(
          "accessToken",
          res.data.accessToken
        );

        localStorage.setItem(
          "refreshToken",
          res.data.refreshToken
        );
        
        axios.defaults.headers.common["Authorization"] = `Bearer ${res.data.accessToken}`;

        const me = await axios.get(
          `${API_URL}/api/auth/me`
        );


        const newUser = buildUser(
          me.data
        );

        localStorage.setItem(
          "user",
          JSON.stringify(newUser)
        );

        setUser(newUser);
      } catch (error: any) {
        const message =
          error.response?.data?.message ||
          error.message ||
          "Registration failed";

        throw new Error(message);
      }
    },
    []
  );

  const logout = useCallback(async () => {
    // Clear client-side state immediately so UI reflects logout
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    delete axios.defaults.headers.common["Authorization"];

    // Await the server logout to clear the session cookie BEFORE any redirect.
    // Otherwise the next /api/auth/me call would still see a valid session
    // and re-log the user back in.
    try {
      await axios.post(`${API_URL}/api/auth/logout`);
    } catch {
      // Server unreachable is non-fatal — local state is already cleared
    }
  }, []);

  const value: AuthContextType = {
    isLoggedIn: !isLoading && !!user,
    isLoading,
    user: isLoading ? null : user,
    login,
    register,
    googleLogin: handleGoogleLogin,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/* ──────────────────────────── Hook ──────────────────────────── */

export function useAuth() {
  return useContext(AuthContext);
}
