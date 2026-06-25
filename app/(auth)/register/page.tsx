"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

/* ──────────────────────────── Constants ──────────────────────────── */

const FILL_STYLE = { fontVariationSettings: "'FILL' 1" } as const;


/* ──────────────────────────── Password Strength ──────────────────────────── */

function getPasswordStrength(pw: string): { level: number; label: string; color: string } {
  if (pw.length === 0) return { level: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 1) return { level: 1, label: "Lemah", color: "bg-error" };
  if (score === 2) return { level: 2, label: "Cukup", color: "bg-tertiary" };
  if (score === 3) return { level: 3, label: "Kuat", color: "bg-secondary" };
  return { level: 4, label: "Sangat Kuat", color: "bg-secondary" };
}

/* ──────────────────────────── Page ──────────────────────────── */

function RegisterPageContent() {
  const { register } = useAuth();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const passwordStrength = getPasswordStrength(password);
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms || passwordsMismatch) return;
    setIsLoading(true);
    setError(null);
    try {
      await register(name, phoneNumber, email, password);
      window.location.href = redirectTo;
    } catch (err: any) {
      setError(err.message || "Registrasi gagal. Silakan coba lagi.");
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-80px)] flex items-center justify-center px-6 py-10">
      {/* ── Register Form ── */}
      <div className="w-full max-w-[440px] space-y-7">
          {/* Header */}
          <div className="text-center">
            {/* Brand */}
            <Link
              href="/"
              className="inline-block mb-5"
            >
              <img src="/logo-v1.png" alt="Flowera" className="h-7 w-auto" />
            </Link>
            <h1 className="font-headline text-[28px] leading-9 font-semibold text-on-surface">
              Buat Akun Baru
            </h1>
            <p className="mt-2 text-on-surface-variant text-[14px] font-body">
              Daftar gratis dan mulai kirim bunga untuk orang tersayang.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-error-container/20 border border-error/20 rounded-xl px-4 py-3 flex items-start gap-3 text-error">
              <span className="material-symbols-outlined text-error text-[20px] mt-0.5" style={FILL_STYLE}>
                error
              </span>
              <div>
                <p className="text-[13px] font-semibold text-error">Gagal Daftar</p>
                <p className="text-[12px] text-error-container mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Social register */}
          <div className="space-y-3">
            <button onClick={() => {window.location.href = "http://localhost:3000/api/auth/google";}} className="w-full flex items-center justify-center gap-3 px-4 py-3.5 border border-outline-variant/40 rounded-xl hover:bg-surface-container-high transition-all active:scale-[0.98] group">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span className="text-[14px] font-medium text-on-surface">
                Daftar dengan Google
              </span>
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <hr className="flex-1 border-outline-variant/30" />
            <span className="text-[12px] text-on-surface-variant font-medium uppercase tracking-wider">
              Atau
            </span>
            <hr className="flex-1 border-outline-variant/30" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-on-surface block">
                Nama Lengkap
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">
                  person
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Masukkan nama lengkap"
                  className="w-full pl-12 pr-4 py-3.5 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[14px] font-body text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  required
                />
              </div>
            </div>

            {/* Email & Phone row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              {/* Username */}
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-on-surface block">
                  Phone Number
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">
                    phone_enabled
                  </span>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ""))}
                    placeholder="Phone Number"
                    className="w-full pl-12 pr-4 py-3.5 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[14px] font-body text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    required
                    minLength={3}
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-on-surface block">
                Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">
                  lock
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 8 karakter"
                  className="w-full pl-12 pr-12 py-3.5 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[14px] font-body text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  required
                  minLength={8}
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

              {/* Password strength indicator */}
              {password.length > 0 && (
                <div className="space-y-1.5 animate-[fadeIn_0.3s_ease]">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all ${
                          i <= passwordStrength.level
                            ? passwordStrength.color
                            : "bg-outline-variant/20"
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-[11px] font-medium ${
                    passwordStrength.level <= 1
                      ? "text-error"
                      : passwordStrength.level === 2
                      ? "text-tertiary"
                      : "text-secondary"
                  }`}>
                    {passwordStrength.label}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-on-surface block">
                Konfirmasi Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">
                  lock
                </span>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password"
                  className={`w-full pl-12 pr-12 py-3.5 bg-surface-container-low border rounded-xl text-[14px] font-body text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/20 transition-all ${
                    passwordsMismatch
                      ? "border-error focus:border-error"
                      : passwordsMatch
                      ? "border-secondary focus:border-secondary"
                      : "border-outline-variant/30 focus:border-primary"
                  }`}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showConfirmPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
                {/* Match indicator */}
                {passwordsMatch && (
                  <span className="absolute right-12 top-1/2 -translate-y-1/2 text-secondary">
                    <span className="material-symbols-outlined text-[18px]" style={FILL_STYLE}>
                      check_circle
                    </span>
                  </span>
                )}
              </div>
              {passwordsMismatch && (
                <p className="text-[11px] text-error font-medium animate-[fadeIn_0.3s_ease]">
                  Password tidak cocok
                </p>
              )}
            </div>

            {/* Terms */}
            <label className="flex items-start gap-2.5 cursor-pointer pt-1">
              <div className="relative mt-0.5">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="peer sr-only"
                  required
                />
                <div className={`w-[18px] h-[18px] rounded border-2 flex items-center justify-center transition-all ${
                  agreeTerms
                    ? "bg-primary border-primary"
                    : "border-outline-variant hover:border-primary/50"
                }`}>
                  {agreeTerms && (
                    <span className="material-symbols-outlined text-white text-[14px]" style={FILL_STYLE}>
                      check
                    </span>
                  )}
                </div>
              </div>
              <span className="text-[12px] text-on-surface-variant leading-4">
                Saya setuju dengan{" "}
                <button type="button" className="text-primary font-semibold hover:underline">
                  Syarat & Ketentuan
                </button>{" "}
                dan{" "}
                <button type="button" className="text-primary font-semibold hover:underline">
                  Kebijakan Privasi
                </button>{" "}
                Flowera.
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={!agreeTerms || passwordsMismatch || isLoading}
              className="w-full bg-primary text-white py-4 rounded-xl font-body text-[14px] tracking-[0.05em] font-semibold shadow-soft hover:shadow-float hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  Buat Akun
                  <span className="material-symbols-outlined text-[18px]">
                    arrow_forward
                  </span>
                </>
              )}
            </button>
          </form>

          {/* Login link */}
          <p className="text-center text-[14px] text-on-surface-variant">
            Sudah punya akun?{" "}
            <Link
              href="/login"
              className="text-primary font-semibold hover:underline"
            >
              Masuk di sini
            </Link>
          </p>
      </div>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <main className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </main>
    }>
      <RegisterPageContent />
    </Suspense>
  );
}
