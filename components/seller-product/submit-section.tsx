"use client";

import React from "react";
import type { SubmitStep } from "@/hooks/use-product-form";

interface SubmitSectionProps {
  isEditMode: boolean;
  isSubmitting: boolean;
  submitStep: SubmitStep;
  onSubmit: () => void;
  onCancel: () => void;
  getStepText: () => string;
}

// ─── Mini progress components ───
function StepIndicator({
  label,
  status,
}: {
  label: string;
  status: "active" | "done" | "pending";
}) {
  return (
    <div
      className={`flex items-center gap-2 text-[12px] ${
        status === "active"
          ? "text-primary font-bold"
          : status === "done"
          ? "text-secondary"
          : "text-on-surface-variant"
      }`}
    >
      <span
        className="material-symbols-outlined text-[16px]"
        style={status === "done" ? { fontVariationSettings: "'FILL' 1" } : {}}
      >
        {status === "active"
          ? "pending"
          : status === "done"
          ? "check_circle"
          : "circle"}
      </span>
      {label}
    </div>
  );
}

function StepDivider({ done }: { done: boolean }) {
  return (
    <div
      className={`w-6 h-[2px] rounded-full ${
        done ? "bg-secondary" : "bg-outline-variant/30"
      }`}
    />
  );
}

/**
 * Submit button bar with step progress indicator and success banner.
 */
export default function SubmitSection({
  isEditMode,
  isSubmitting,
  submitStep,
  onSubmit,
  onCancel,
  getStepText,
}: SubmitSectionProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-soft border border-outline-variant/20">
      {/* Success Alert */}
      {submitStep === "done" && (
        <div className="flex items-center gap-3 p-4 mb-4 bg-secondary-container rounded-xl border border-secondary/20 animate-[fadeIn_0.2s_ease]">
          <span
            className="material-symbols-outlined text-[20px] text-secondary"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            check_circle
          </span>
          <p className="text-[14px] font-semibold text-on-secondary-container">
            {isEditMode
              ? "Produk berhasil diperbarui! Mengalihkan ke daftar produk..."
              : "Produk berhasil ditambahkan! Mengalihkan ke daftar produk..."}
          </p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="w-full sm:w-auto px-8 py-3.5 border border-outline-variant/40 text-on-surface font-semibold text-[14px] rounded-xl hover:bg-surface-container transition-colors disabled:opacity-50"
        >
          Batal
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting || submitStep === "done"}
          className={`w-full sm:flex-1 py-3.5 rounded-xl text-[14px] font-semibold text-white shadow-soft transition-all flex items-center justify-center gap-2 ${
            isSubmitting || submitStep === "done"
              ? "bg-primary/60 cursor-not-allowed"
              : "bg-primary hover:shadow-float active:scale-[0.98]"
          }`}
        >
          {isSubmitting || submitStep === "done" ? (
            <>
              {submitStep === "done" ? (
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
              ) : (
                <span className="material-symbols-outlined animate-spin text-[20px]">
                  progress_activity
                </span>
              )}
              {getStepText()}
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[18px]">
                {isEditMode ? "save" : "add"}
              </span>
              {isEditMode ? "Simpan Perubahan" : "Tambah Produk"}
            </>
          )}
        </button>
      </div>

      {/* Progress steps indicator */}
      {isSubmitting && (
        <div className="flex items-center justify-center gap-2 md:gap-4 mt-4 pt-4 border-t border-outline-variant/20 flex-wrap">
          {/* Step 1: Save Product */}
          <StepIndicator
            label={isEditMode ? "Simpan Data" : "Buat Produk"}
            status={
              submitStep === "saving"
                ? "active"
                : submitStep === "idle"
                ? "pending"
                : "done"
            }
          />
          <StepDivider
            done={submitStep !== "saving" && submitStep !== "idle"}
          />
          {/* Step 2: Upload Foto */}
          <StepIndicator
            label="Upload Foto"
            status={
              submitStep === "uploading"
                ? "active"
                : submitStep === "saving" || submitStep === "idle"
                ? "pending"
                : "done"
            }
          />
          <StepDivider
            done={
              submitStep === "creating_variants" ||
              submitStep === "creating_addons" ||
              submitStep === "done"
            }
          />
          {/* Step 3: Varian */}
          <StepIndicator
            label="Varian"
            status={
              submitStep === "creating_variants"
                ? "active"
                : submitStep === "creating_addons" || submitStep === "done"
                ? "done"
                : "pending"
            }
          />
          <StepDivider
            done={submitStep === "creating_addons" || submitStep === "done"}
          />
          {/* Step 4: Addon */}
          <StepIndicator
            label="Addon"
            status={
              submitStep === "creating_addons"
                ? "active"
                : submitStep === "done"
                ? "done"
                : "pending"
            }
          />
          <StepDivider done={submitStep === "done"} />
          {/* Step 5: Selesai */}
          <StepIndicator
            label="Selesai"
            status={submitStep === "done" ? "active" : "pending"}
          />
        </div>
      )}
    </div>
  );
}
