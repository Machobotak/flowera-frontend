"use client";

import React from "react";
import Link from "next/link";

interface NotFoundStateProps {
  title?: string;
  message?: string;
  backHref?: string;
}

/**
 * Generic "not found" display with back-to-home link.
 */
export default function NotFoundState({
  title = "Tidak Ditemukan",
  message = "Data yang kamu cari tidak tersedia atau telah dihapus.",
  backHref = "/",
}: NotFoundStateProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center text-center py-16 px-4">
        <div className="w-20 h-20 rounded-full bg-outline/10 flex items-center justify-center mb-5">
          <span className="material-symbols-outlined text-outline text-4xl">
            search_off
          </span>
        </div>
        <h2 className="font-headline text-[24px] font-semibold text-on-surface mb-2">
          {title}
        </h2>
        <p className="text-on-surface-variant text-[14px] max-w-sm mb-8">
          {message}
        </p>
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-xl font-body text-[14px] font-semibold shadow-soft hover:shadow-float transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">
            arrow_back
          </span>
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
