"use client";

import React from "react";
import { FILL_STYLE } from "@/utils/format";

export default function StepIndicator({ step }: { step: number }) {
  const steps = [
    { label: "Alamat", icon: "location_on" },
    { label: "Pengiriman", icon: "local_shipping" },
    { label: "Pembayaran", icon: "payment" },
    { label: "Selesai", icon: "check_circle" },
  ];

  const effectiveStep = step >= 5 ? 5 : step;

  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {steps.map((s, i) => (
        <React.Fragment key={s.label}>
          <div className="flex items-center gap-2">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-[14px] font-bold transition-all ${
                i + 1 <= effectiveStep
                  ? "bg-primary text-white shadow-soft"
                  : "bg-surface-container-high text-on-surface-variant"
              }`}
            >
              {i + 1 < effectiveStep ? (
                <span className="material-symbols-outlined text-[18px]" style={FILL_STYLE}>check</span>
              ) : (
                <span className="material-symbols-outlined text-[18px]">{s.icon}</span>
              )}
            </div>
            <span
              className={`text-[13px] font-semibold hidden sm:block ${
                i + 1 <= effectiveStep ? "text-primary" : "text-on-surface-variant"
              }`}
            >
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`w-8 sm:w-16 h-[2px] mx-2 rounded-full transition-all ${
                i + 1 < effectiveStep ? "bg-primary" : "bg-outline-variant/30"
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
