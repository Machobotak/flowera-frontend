"use client";

import React from "react";
import type { Toast } from "@/hooks/use-toast";

export default function ToastContainer({
  toasts,
  onRemove,
}: {
  toasts: Toast[];
  onRemove: (id: number) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-xl border animate-[fadeIn_0.3s_ease] ${
            toast.type === "error"
              ? "bg-error-container border-error/20"
              : "bg-secondary-container border-secondary/20"
          }`}
        >
          <span
            className={`material-symbols-outlined text-[20px] mt-0.5 ${
              toast.type === "error" ? "text-error" : "text-secondary"
            }`}
            style={toast.type === "success" ? { fontVariationSettings: "'FILL' 1" } : {}}
          >
            {toast.type === "error" ? "error" : "check_circle"}
          </span>
          <div className="flex-1 min-w-0">
            <p
              className={`text-[13px] font-semibold ${
                toast.type === "error" ? "text-on-error-container" : "text-on-secondary-container"
              }`}
            >
              {toast.type === "error" ? "Terjadi Kesalahan" : "Berhasil"}
            </p>
            <p
              className={`text-[12px] ${
                toast.type === "error" ? "text-on-error-container/80" : "text-on-secondary-container/80"
              }`}
            >
              {toast.message}
            </p>
          </div>
          <button
            onClick={() => onRemove(toast.id)}
            className={`shrink-0 ${
              toast.type === "error"
                ? "text-on-error-container/60 hover:text-on-error-container"
                : "text-on-secondary-container/60 hover:text-on-secondary-container"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      ))}
    </div>
  );
}
