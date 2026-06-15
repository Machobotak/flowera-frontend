"use client";

import React, { useState } from "react";
import Link from "next/link";

/* ──────────────────────────── Constants ──────────────────────────── */

const FILL_STYLE = { fontVariationSettings: "'FILL' 1" } as const;

const TESTIMONIALS = [
  {
    text: "FloraGrace mengubah cara saya mengirim bunga. Selalu segar dan indah!",
    author: "Sarah K.",
    role: "Pelanggan Setia",
  },
  {
    text: "Florist terbaik di Jakarta. Pengiriman cepat dan bouquet-nya selalu sempurna.",
    author: "Andi M.",
    role: "Corporate Client",
  },
];

/* ──────────────────────────── Page ──────────────────────────── */

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login logic
  };

  return (
    <main className="min-h-[calc(100vh-80px)] flex">
      {/* ── Left: Decorative Panel ── */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[560px] flex-shrink-0 relative overflow-hidden">
        {/* Background image */}
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCHU-MNzSwSUbbUPvKZvCkAJnjjr1Q74pczA_BThQ1vmUXiAhigqFmfVM6UJBm6PKYLM6lwwR3NMrcTTLt9dYI6OdgW0NKTbW4t9TA8qu-ZUJaBia7VZ6ym3L57bQlqRQnEc0s2CL8xzuJjMzuFph9CXFRr3tv-TDqJl2Ju2inAm_6q0EVgsVwlto2C5UtHP0eocusr5WBn4VLNDYxwoz6p-itwOP7TBGSVeE-XuAy14jdF2ULjhxN4qEUGFGCz-m7liS_ZWUqg-1Y"
          alt="Premium bouquet arrangement"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-primary/20" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-10 h-full w-full">
          {/* Top: Brand */}
          <div>
            <Link
              href="/"
              className="font-headline text-[28px] font-bold text-white tracking-tight"
            >
              FloraGrace
            </Link>
            <p className="mt-2 text-white/70 text-[14px] font-body max-w-xs">
              The world&apos;s most curated marketplace for meaningful floral gifts.
            </p>
          </div>

          {/* Bottom: Testimonial */}
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <div className="flex gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className="material-symbols-outlined text-tertiary-fixed text-[16px]"
                    style={FILL_STYLE}
                  >
                    star
                  </span>
                ))}
              </div>
              <p className="text-white/90 text-[14px] leading-6 italic font-body">
                &ldquo;{TESTIMONIALS[0].text}&rdquo;
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center">
                  <span className="text-on-primary-container font-bold text-[13px]">
                    {TESTIMONIALS[0].author[0]}
                  </span>
                </div>
                <div>
                  <p className="text-white text-[13px] font-semibold">
                    {TESTIMONIALS[0].author}
                  </p>
                  <p className="text-white/50 text-[11px]">
                    {TESTIMONIALS[0].role}
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-8">
              <div>
                <p className="text-white font-bold text-[22px] font-headline">10K+</p>
                <p className="text-white/50 text-[11px]">Pelanggan Puas</p>
              </div>
              <div>
                <p className="text-white font-bold text-[22px] font-headline">500+</p>
                <p className="text-white/50 text-[11px]">Florist Partner</p>
              </div>
              <div>
                <p className="text-white font-bold text-[22px] font-headline">4.9</p>
                <p className="text-white/50 text-[11px]">Rating Rata-rata</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right: Login Form ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[420px] space-y-8">
          {/* Header */}
          <div className="text-center lg:text-left">
            {/* Mobile brand */}
            <Link
              href="/"
              className="lg:hidden font-headline text-[24px] font-bold text-primary tracking-tight inline-block mb-6"
            >
              FloraGrace
            </Link>
            <h1 className="font-headline text-[28px] leading-9 font-semibold text-on-surface">
              Selamat Datang Kembali
            </h1>
            <p className="mt-2 text-on-surface-variant text-[14px] font-body">
              Masuk ke akun kamu untuk melanjutkan belanja bunga.
            </p>
          </div>

          {/* Social login */}
          <div className="space-y-3">
            <button className="w-full flex items-center justify-center gap-3 px-4 py-3.5 border border-outline-variant/40 rounded-xl hover:bg-surface-container-high transition-all active:scale-[0.98] group">
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
          <form onSubmit={handleSubmit} className="space-y-5">
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
              className="w-full bg-primary text-white py-4 rounded-xl font-body text-[14px] tracking-[0.05em] font-semibold shadow-soft hover:shadow-float hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              Masuk
              <span className="material-symbols-outlined text-[18px]">
                arrow_forward
              </span>
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
      </div>
    </main>
  );
}
