"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function ComingSoonPage() {
  const router = useRouter();

  return (
    <main className="relative min-h-screen flex items-center justify-center px-6 bg-surface overflow-hidden">
      {/* Decorative Background */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[400px] h-[400px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-tertiary/8 blur-3xl" />
        <div className="absolute top-1/4 -right-20 w-[250px] h-[250px] rounded-full bg-secondary/6 blur-3xl" />
        <div className="absolute top-[20%] left-[15%] w-3 h-3 rounded-full bg-primary/20" />
        <div className="absolute top-[35%] right-[20%] w-2 h-2 rounded-full bg-tertiary/25" />
        <div className="absolute bottom-[30%] left-[25%] w-2.5 h-2.5 rounded-full bg-secondary/20" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-md animate-[fadeIn_0.4s_ease]">
        {/* Logo */}
        <img
          src="/logo-v1-transparant.png"
          alt="Flowera"
          className="h-10 w-auto mb-10"
        />

        {/* Illustration */}
        <div className="relative mb-8 animate-[slideUp_0.5s_ease]">
          <div className="w-44 h-44 rounded-full bg-primary-container/30 flex items-center justify-center shadow-soft">
            <span
              className="material-symbols-outlined text-[96px] text-primary leading-none"
              style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
            >
              construction
            </span>
          </div>
          {/* Sparkle badge */}
          <div className="absolute -bottom-1 -right-1 w-14 h-14 rounded-full bg-secondary-container flex items-center justify-center shadow-float border-2 border-surface">
            <span className="material-symbols-outlined text-[28px] text-secondary">
              auto_awesome
            </span>
          </div>
          {/* Floating icons */}
          <span
            className="material-symbols-outlined absolute -top-2 -left-3 text-[20px] text-primary/40 animate-[fadeIn_0.6s_ease_0.3s_both]"
            style={{ fontVariationSettings: "'FILL' 0" }}
          >
            spa
          </span>
          <span
            className="material-symbols-outlined absolute top-1/2 -right-5 text-[16px] text-secondary/40 animate-[fadeIn_0.6s_ease_0.5s_both]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            eco
          </span>
        </div>

        {/* Text */}
        <div className="animate-[slideUp_0.5s_ease_0.2s_both]">
          <h1 className="font-headline text-[28px] font-bold text-on-surface mb-3">
            Sedang Dalam Pengembangan
          </h1>
          <p className="text-on-surface-variant text-[14px] leading-relaxed mb-8 max-w-[340px]">
            Fitur ini sedang kami kembangkan untuk memberikan pengalaman terbaik buat kamu. Sabar ya, bakal segera hadir! 🌸
          </p>
        </div>

        {/* Actions */}
        <div className="animate-[slideUp_0.5s_ease_0.3s_both]">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-8 py-4 bg-primary text-white rounded-xl text-[14px] font-semibold shadow-soft hover:shadow-float hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Kembali
          </button>
        </div>

        {/* Footer */}
        <p className="mt-14 text-[12px] text-on-surface-variant/50 animate-[fadeIn_0.4s_ease_0.5s_both]">
          &copy; {new Date().getFullYear()} Flowera. All rights reserved.
        </p>
      </div>
    </main>
  );
}
