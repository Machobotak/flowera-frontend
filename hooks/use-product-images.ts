"use client";

import { useState, useCallback } from "react";
import axios from "axios";

export interface ImagePreview {
  id: string;
  backendId?: number;
  file?: File;
  preview: string;
  isExisting?: boolean;
  isDefault?: boolean;
}

/**
 * Encapsulates image state management for the product form.
 * Handles add/remove, drag-and-drop, and set-cover API calls.
 */
export function useProductImages() {
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [defaultImageId, setDefaultImageId] = useState<string | null>(null);
  const [settingCoverId, setSettingCoverId] = useState<string | null>(null);

  // ─── Add files ───
  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const newImages: ImagePreview[] = [];
      const fileArray = Array.from(files);
      for (const file of fileArray) {
        if (!file.type.startsWith("image/")) continue;
        if (images.length + newImages.length >= 5) break;
        newImages.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          file,
          preview: URL.createObjectURL(file),
          isExisting: false,
        });
      }
      setImages((prev) => [...prev, ...newImages]);
    },
    [images.length]
  );

  // ─── Remove image ───
  const removeImage = useCallback((id: string) => {
    setImages((prev) => {
      const removed = prev.find((img) => img.id === id);
      if (removed && !removed.isExisting && removed.file)
        URL.revokeObjectURL(removed.preview);
      return prev.filter((img) => img.id !== id);
    });
  }, []);

  // ─── Drop handler ───
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (e.dataTransfer.files) addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  // ─── Set default cover ───
  const setDefaultCover = useCallback(
    async (img: ImagePreview, productId: number) => {
      if (!img.backendId || settingCoverId) return;

      setSettingCoverId(img.id);
      try {
        await axios.post(
          `/api/seller/product/images/default/${img.backendId}`,
          { product_id: productId },
          { withCredentials: true }
        );
        setDefaultImageId(img.id);
        setImages((prev) =>
          prev.map((i) => ({ ...i, isDefault: i.id === img.id }))
        );
      } finally {
        setSettingCoverId(null);
      }
    },
    [settingCoverId]
  );

  // ─── Load existing images from product data ───
  const loadExistingImages = useCallback(
    (
      existingImages: any[],
      storageBase: string
    ) => {
      const resolved: ImagePreview[] = existingImages.map((img: any) => {
        const raw =
          img.image_url ||
          img.url ||
          img.path ||
          (typeof img === "string" ? img : "");
        let previewUrl = raw;
        if (raw && !raw.startsWith("http")) {
          previewUrl = raw.startsWith("/")
            ? `${storageBase}${raw}`
            : `${storageBase}/${raw}`;
        }
        const imgId = img.id || Math.random();
        return {
          id: `existing-${imgId}`,
          backendId:
            typeof img.id === "number" ? img.id : parseInt(img.id) || undefined,
          preview: previewUrl,
          isExisting: true,
          isDefault: img.isDefault || img.is_default || false,
        };
      });
      setImages(resolved);

      const defaultImg = resolved.find((img) => img.isDefault);
      if (defaultImg) setDefaultImageId(defaultImg.id);
    },
    []
  );

  return {
    images,
    setImages,
    isDragOver,
    setIsDragOver,
    defaultImageId,
    settingCoverId,
    addFiles,
    removeImage,
    handleDrop,
    setDefaultCover,
    loadExistingImages,
  };
}
