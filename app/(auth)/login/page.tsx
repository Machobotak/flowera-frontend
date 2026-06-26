"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import ToastContainer from "@/components/toast-container";

/* ──────────────────────────── Constants ──────────────────────────── */

const FILL_STYLE = { fontVariationSettings: "'FILL' 1" } as const;


/* ──────────────────────────── Page ──────────────────────────── */

function LoginPageContent() {
  const { login } = useAuth();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";

  // Auto-fill for prototype
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { toasts, addToast, removeToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      window.location.href = redirectTo;
    } catch (err: any) {
      addToast(err.message || "Email atau password salah.", "error");
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-80px)] flex items-center justify-center px-6 py-12">
      {/* ── Login Form ── */}
      <div className="w-full max-w-[420px] space-y-8">
          {/* Header */}
          <div className="text-center">
            {/* Brand */}
            <Link
              href="/"
              className="inline-block mb-6"
            >
              <img src="/logo-v1.png" alt="Flowera" className="h-7 w-auto" />
            </Link>
            <h1 className="font-headline text-[28px] leading-9 font-semibold text-on-surface">
              Selamat Datang Kembali
            </h1>
            <p className="mt-2 text-on-surface-variant text-[14px] font-body">
              Masuk ke akun kamu untuk melanjutkan belanja bunga.
            </p>
          </div>

          <ToastContainer toasts={toasts} onRemove={removeToast} />

          {/* Social login */}
          <div className="space-y-3">
            <button onClick={() => {window.location.href = "http://localhost:3000/api/auth/google";}} className="w-full flex items-center justify-center gap-3 px-4 py-3.5 border border-outline-variant/40 rounded-xl hover:bg-surface-container-high transition-all active:scale-[0.98] group">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span className="text-[14px] font-medium text-on-surface">
                Masuk dengan Google
              </span>
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <hr className="flex-1 border-outline-variant/30" />
            <span className="text-[12px] text-on-surface-variant font-medium uppercase tracking-wider">
              atau
            </span>
            <hr className="flex-1 border-outline-variant/30" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-on-surface block">
                Email
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">
                  mail
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full pl-12 pr-4 py-3.5 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[14px] font-body text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[13px] font-semibold text-on-surface">
                  Password
                </label>
                <button
                  type="button"
                  className="text-[12px] text-primary font-semibold hover:underline"
                >
                  Lupa password?
                </button>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">
                  lock
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="w-full pl-12 pr-12 py-3.5 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[14px] font-body text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember me */}
            <label className="flex items-center gap-2.5 cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="peer sr-only"
                />
                <div className={`w-[18px] h-[18px] rounded border-2 flex items-center justify-center transition-all ${
                  rememberMe
                    ? "bg-primary border-primary"
                    : "border-outline-variant hover:border-primary/50"
                }`}>
                  {rememberMe && (
                    <span className="material-symbols-outlined text-white text-[14px]" style={FILL_STYLE}>
                      check
                    </span>
                  )}
                </div>
              </div>
              <span className="text-[13px] text-on-surface-variant">
                Ingat saya di perangkat ini
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-white py-4 rounded-xl font-body text-[14px] tracking-[0.05em] font-semibold shadow-soft hover:shadow-float hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait"
            >
              {isLoading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  Masuk
                  <span className="material-symbols-outlined text-[18px]">
                    arrow_forward
                  </span>
                </>
              )}
            </button>
          </form>

          {/* Register link */}
          <p className="text-center text-[14px] text-on-surface-variant">
            Belum punya akun?{" "}
            <Link
              href="/register"
              className="text-primary font-semibold hover:underline"
            >
              Daftar sekarang
            </Link>
          </p>

          {/* Trust footer */}
          <div className="flex items-center justify-center gap-5 pt-2 text-[10px] text-on-surface-variant">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-secondary">
                verified_user
              </span>
              Data terenkripsi
            </span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-secondary">
                shield
              </span>
              Privasi terjaga
            </span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-secondary">
                lock
              </span>
              SSL Secured
            </span>
          </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </main>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
