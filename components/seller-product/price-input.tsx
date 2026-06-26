"use client";

import React from "react";

interface PriceInputProps {
  value: string;
  onChange: (rawValue: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
}

/**
 * Reusable formatted price input with Rp prefix.
 * Stores raw digits-only string, displays with thousand separators.
 */
export default function PriceInput({
  value,
  onChange,
  placeholder = "0",
  label,
  required,
  disabled,
}: PriceInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value.replace(/\D/g, ""));
  };

  const displayValue = value
    ? parseInt(value).toLocaleString("id-ID")
    : "";

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-[12px] font-semibold text-on-surface-variant">
          {label}
          {required && <span className="text-error"> *</span>}
        </label>
      )}
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[13px] font-semibold text-on-surface-variant">
          Rp
        </span>
        <input
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full pl-11 pr-4 py-3 bg-white border border-outline-variant/30 rounded-xl text-[13px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-outline-variant outline-none disabled:opacity-50"
        />
      </div>
    </div>
  );
}
