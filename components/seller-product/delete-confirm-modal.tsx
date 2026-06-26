"use client";

import React from "react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  title: string;
  itemName: string;
  description: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  confirmingLabel?: string;
  /** Optional error message to show inside the modal */
  error?: string | null;
}

/**
 * Reusable delete confirmation modal.
 * Used for: product deletion, variant deletion, addon deletion.
 */
export default function DeleteConfirmModal({
  isOpen,
  title,
  itemName,
  description,
  isDeleting,
  onConfirm,
  onCancel,
  confirmLabel = "Hapus",
  confirmingLabel = "Menghapus...",
  error,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-[fadeIn_0.15s_ease]"
        onClick={!isDeleting ? onCancel : undefined}
      />
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full animate-[slideUp_0.2s_ease]">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-full bg-error-container flex items-center justify-center">
            <span
              className="material-symbols-outlined text-[28px] text-error"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              delete
            </span>
          </div>
          <div>
            <h3 className="text-[18px] font-bold text-on-surface">{title}</h3>
            <p className="text-[13px] text-on-surface-variant mt-1">
              {description}{" "}
              <span className="font-semibold text-on-surface">
                &quot;{itemName}&quot;
              </span>{" "}
              akan dihapus secara permanen.
            </p>
          </div>

          {/* Error message inside modal */}
          {error && (
            <div className="w-full flex items-start gap-2 p-3 bg-error-container rounded-xl text-left">
              <span className="material-symbols-outlined text-[18px] text-error shrink-0 mt-0.5">
                error
              </span>
              <p className="text-[12px] text-on-error-container">{error}</p>
            </div>
          )}

          <div className="flex gap-3 w-full">
            <button
              onClick={onCancel}
              disabled={isDeleting}
              className="flex-1 py-3 border border-outline-variant/40 text-on-surface font-semibold text-[14px] rounded-xl hover:bg-surface-container transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 py-3 bg-error text-white font-semibold text-[14px] rounded-xl hover:bg-error/90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isDeleting ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[18px]">
                    progress_activity
                  </span>
                  {confirmingLabel}
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">
                    delete
                  </span>
                  {confirmLabel}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
