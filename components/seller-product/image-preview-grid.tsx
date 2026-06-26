"use client";

import React from "react";
import type { ImagePreview } from "@/hooks/use-product-images";

interface ImagePreviewGridProps {
  images: ImagePreview[];
  defaultImageId: string | null;
  settingCoverId: string | null;
  isEditMode: boolean;
  onSetCover: (img: ImagePreview) => void;
  onRemove: (id: string) => void;
}

/**
 * Reusable image preview grid with cover/remove overlays.
 */
export default function ImagePreviewGrid({
  images,
  defaultImageId,
  settingCoverId,
  isEditMode,
  onSetCover,
  onRemove,
}: ImagePreviewGridProps) {
  if (images.length === 0) {
    return (
      <p className="text-[12px] text-on-surface-variant text-center mt-3 opacity-60">
        Foto pertama yang diunggah akan menjadi foto utama produk
      </p>
    );
  }

  return (
    <div
      className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 ${
        images.length < 5 ? "mt-4" : ""
      }`}
    >
      {images.map((img, index) => {
        const isCover = img.id === defaultImageId;
        const isSettingThis = settingCoverId === img.id;

        return (
          <div
            key={img.id}
            className={`relative group aspect-square rounded-xl overflow-hidden border-2 transition-all ${
              isCover
                ? "border-primary ring-2 ring-primary/30"
                : "border-outline-variant/20 hover:border-primary/40"
            }`}
          >
            <img
              src={img.preview}
              alt={`Preview ${index + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://ui-avatars.com/api/?name=IMG&background=8c4a5c&color=fff";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            {/* Cover badge */}
            {isCover && (
              <div className="absolute top-2 left-2 px-2 py-0.5 bg-primary text-white text-[10px] font-bold rounded-md flex items-center gap-1">
                <span
                  className="material-symbols-outlined text-[12px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  star
                </span>
                Cover
              </div>
            )}

            {/* Existing badge */}
            {img.isExisting && !isCover && (
              <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/50 text-white text-[10px] font-bold rounded-md">
                Tersimpan
              </div>
            )}

            {/* Set as Cover button */}
            {img.isExisting && img.backendId && !isCover && isEditMode && (
              <button
                type="button"
                onClick={() => onSetCover(img)}
                disabled={!!settingCoverId}
                className="absolute bottom-2 left-2 px-2 py-1 bg-white/90 hover:bg-white text-primary text-[10px] font-bold rounded-md opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1 disabled:opacity-50"
              >
                {isSettingThis ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[12px]">
                      progress_activity
                    </span>
                    Mengatur...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[12px]">
                      photo_camera_front
                    </span>
                    Jadikan Cover
                  </>
                )}
              </button>
            )}

            {/* Remove button */}
            <button
              type="button"
              onClick={() => onRemove(img.id)}
              className="absolute top-2 right-2 w-7 h-7 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
            >
              <span className="material-symbols-outlined text-[16px] text-error">
                close
              </span>
            </button>
          </div>
        );
      })}
    </div>
  );
}
