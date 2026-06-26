"use client";

import React from "react";
import Link from "next/link";

interface ErrorStateProps {
  onRetry: () => void;
  title?: string;
  message?: string;
  backHref?: string;
}

/**
 * Generic error display with retry button and optional back link.
 */
export default function ErrorState({
  onRetry,
  title = "Gagal Memuat",
  message = "Terjadi kesalahan saat memuat data. Silakan coba lagi.",
  backHref = "/",
}: ErrorStateProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center text-center py-16 px-4">
        <div className="w-20 h-20 rounded-full bg-error-container/20 flex items-center justify-center mb-5">
          <span className="material-symbols-outlined text-error text-4xl">
            error
          </span>
        </div>
        <h2 className="font-headline text-[24px] font-semibold text-on-surface mb-2">
          {title}
        </h2>
        <p className="text-on-surface-variant text-[14px] max-w-sm mb-8">
          {message}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onRetry}
            className="px-8 py-4 bg-primary text-white rounded-xl font-body text-[14px] font-semibold shadow-soft hover:shadow-float transition-all"
          >
            Coba Lagi
          </button>
          <Link
            href={backHref}
            className="px-8 py-4 border border-outline-variant/30 text-on-surface-variant rounded-xl font-body text-[14px] font-semibold hover:bg-surface-container transition-all"
          >
            Kembali
          </Link>
        </div>
      </div>
    </div>
  );
}
