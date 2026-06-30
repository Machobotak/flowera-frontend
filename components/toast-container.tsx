"use client";

import React from "react";
import type { Toast } from "@/hooks/use-toast";

function getToastClasses(type: Toast["type"]) {
  switch (type) {
    case "error":
      return {
        bg: "bg-error-container border-error/20",
        icon: "text-error",
        title: "text-on-error-container",
        msg: "text-on-error-container/80",
        close: "text-on-error-container/60 hover:text-on-error-container",
        iconName: "error",
        titleText: "Terjadi Kesalahan",
      };
    case "info":
      return {
        bg: "bg-tertiary-container border-tertiary/20",
        icon: "text-tertiary",
        title: "text-on-tertiary-container",
        msg: "text-on-tertiary-container/80",
        close: "text-on-tertiary-container/60 hover:text-on-tertiary-container",
        iconName: "info",
        titleText: "Info",
      };
    default: // success
      return {
        bg: "bg-secondary-container border-secondary/20",
        icon: "text-secondary",
        title: "text-on-secondary-container",
        msg: "text-on-secondary-container/80",
        close: "text-on-secondary-container/60 hover:text-on-secondary-container",
        iconName: "check_circle",
        titleText: "Berhasil",
      };
  }
}

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
      {toasts.map((toast) => {
        const c = getToastClasses(toast.type);
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-xl border animate-[fadeIn_0.3s_ease] ${c.bg}`}
          >
            <span
              className={`material-symbols-outlined text-[20px] mt-0.5 ${c.icon}`}
              style={toast.type === "success" ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              {c.iconName}
            </span>
            <div className="flex-1 min-w-0">
              <p className={`text-[13px] font-semibold ${c.title}`}>{c.titleText}</p>
              <p className={`text-[12px] ${c.msg}`}>{toast.message}</p>
            </div>
            <button
              onClick={() => onRemove(toast.id)}
              className={`shrink-0 ${c.close}`}
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        );
      })}
    </div>
  );
}
