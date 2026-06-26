"use client";

import React, { useRef } from "react";

interface ImageUploadZoneProps {
  onFilesSelected: (files: FileList | File[]) => void;
  isDragOver: boolean;
  setIsDragOver: (v: boolean) => void;
  maxFiles?: number;
  currentCount: number;
}

/**
 * Reusable drag-and-drop image upload zone.
 * Manages its own internal file input ref.
 */
export default function ImageUploadZone({
  onFilesSelected,
  isDragOver,
  setIsDragOver,
  maxFiles = 5,
  currentCount,
}: ImageUploadZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (currentCount >= maxFiles) return null;

  return (
    <div
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOver(false);
        if (e.dataTransfer.files) onFilesSelected(e.dataTransfer.files);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onClick={() => fileInputRef.current?.click()}
      className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
        isDragOver
          ? "border-primary bg-primary-container/10 scale-[1.01]"
          : "border-outline-variant/40 hover:border-primary/50 hover:bg-surface-container-low"
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) onFilesSelected(e.target.files);
          e.target.value = "";
        }}
      />
      <div className="flex flex-col items-center gap-3">
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
            isDragOver ? "bg-primary-container" : "bg-surface-container"
          }`}
        >
          <span
            className={`material-symbols-outlined text-[28px] transition-colors ${
              isDragOver ? "text-primary" : "text-on-surface-variant"
            }`}
          >
            cloud_upload
          </span>
        </div>
        <div>
          <p className="text-[14px] font-semibold text-on-surface">
            {isDragOver ? "Lepaskan file di sini" : "Tarik & lepas foto di sini"}
          </p>
          <p className="text-[13px] text-on-surface-variant mt-1">
            atau{" "}
            <span className="text-primary font-semibold hover:underline">
              pilih dari perangkat
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
