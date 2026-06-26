"use client";

import { useState, useCallback } from "react";
import type { SubEntityItem } from "@/types/product";

interface SubEntityConfig {
  idPrefix: string; // "var" or "addon"
}

/**
 * Generic CRUD state management hook for sub-entity forms (variants & addons).
 * Eliminates ~500 lines of duplicated handler logic.
 *
 * Extra fields (e.g. variant's sub_title) are handled outside the hook
 * via the `extra` parameter on addItem/applyEdit.
 */
export function useSubEntity<T extends SubEntityItem>({
  idPrefix,
}: SubEntityConfig) {
  // ─── Items list ───
  const [items, setItems] = useState<T[]>([]);

  // ─── New item form ───
  const [newTitle, setNewTitle] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newImage, setNewImage] = useState<File | null>(null);
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null);

  const clearNewForm = useCallback(() => {
    const prev = newImagePreview;
    setNewTitle("");
    setNewPrice("");
    setNewImage(null);
    setNewImagePreview(null);
    if (prev?.startsWith("blob:")) {
      requestAnimationFrame(() => URL.revokeObjectURL(prev));
    }
  }, [newImagePreview]);

  /**
   * Add a new item to the list and clear the add form.
   * Pass extra fields (e.g. sub_title) via the `extra` parameter.
   */
  const addItem = useCallback(
    (extra?: Partial<T>) => {
      const item = {
        ...(extra || {}),
        localId: `${idPrefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        title: newTitle.trim(),
        price: newPrice,
        imageFile: newImage || undefined,
        imagePreview: newImagePreview || undefined,
      } as T;
      setItems((prev) => [...prev, item]);
      clearNewForm();
    },
    [newTitle, newPrice, newImage, newImagePreview, clearNewForm, idPrefix]
  );

  // ─── Image change handlers ───
  const handleNewImageChange = useCallback(
    (file: File | null) => {
      const prev = newImagePreview;
      if (!file || !file.type.startsWith("image/")) return;
      setNewImage(file);
      setNewImagePreview(URL.createObjectURL(file));
      if (prev?.startsWith("blob:")) {
        requestAnimationFrame(() => URL.revokeObjectURL(prev));
      }
    },
    [newImagePreview]
  );

  const clearNewImage = useCallback(() => {
    const prev = newImagePreview;
    setNewImage(null);
    setNewImagePreview(null);
    if (prev?.startsWith("blob:")) {
      requestAnimationFrame(() => URL.revokeObjectURL(prev));
    }
  }, [newImagePreview]);

  // ─── Edit state ───
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editImage, setEditImage] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);

  const startEdit = useCallback((item: T) => {
    setEditingId(item.localId);
    setEditTitle(item.title);
    setEditPrice(item.price);
    setEditImage(null);
    setEditImagePreview(item.imagePreview || null);
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setEditTitle("");
    setEditPrice("");
    const prev = editImage ? editImagePreview : null;
    setEditImage(null);
    setEditImagePreview(null);
    if (prev?.startsWith("blob:")) {
      requestAnimationFrame(() => URL.revokeObjectURL(prev));
    }
  }, [editImage, editImagePreview]);

  const handleEditImageChange = useCallback(
    (file: File | null) => {
      if (!file || !file.type.startsWith("image/")) return;
      const prev = editImage ? editImagePreview : null;
      setEditImage(file);
      setEditImagePreview(URL.createObjectURL(file));
      if (prev?.startsWith("blob:")) {
        requestAnimationFrame(() => URL.revokeObjectURL(prev));
      }
    },
    [editImage, editImagePreview]
  );

  /**
   * Apply edit to local state. Pass extra fields via `extra` parameter.
   * Does NOT make API calls — that's the caller's responsibility.
   */
  const applyEdit = useCallback(
    (extra?: Partial<T>) => {
      if (!editingId) return;
      setItems((prev) =>
        prev.map((item) =>
          item.localId === editingId
            ? ({
                ...item,
                ...(extra || {}),
                title: editTitle.trim(),
                price: editPrice,
                imageFile: editImage || item.imageFile,
                imagePreview: editImage
                  ? editImagePreview
                  : item.imagePreview,
              } as T)
            : item
        )
      );
      cancelEdit();
    },
    [editingId, editTitle, editPrice, editImage, editImagePreview, cancelEdit]
  );

  // ─── Delete confirmation ───
  const [itemToDelete, setItemToDelete] = useState<T | null>(null);
  const [isSavingId, setIsSavingId] = useState<string | null>(null);

  const removeItem = useCallback((localId: string) => {
    setItems((prev) => {
      const target = prev.find((i) => i.localId === localId);
      if (target?.imagePreview && target.imagePreview.startsWith("blob:")) {
        requestAnimationFrame(() => URL.revokeObjectURL(target.imagePreview!));
      }
      return prev.filter((i) => i.localId !== localId);
    });
  }, []);

  return {
    // Items
    items,
    setItems,
    addItem,
    removeItem,

    // New form
    newTitle,
    setNewTitle,
    newPrice,
    setNewPrice,
    newImage,
    newImagePreview,
    handleNewImageChange,
    clearNewImage,
    clearNewForm,

    // Edit
    editingId,
    startEdit,
    cancelEdit,
    applyEdit,
    editTitle,
    setEditTitle,
    editPrice,
    setEditPrice,
    editImage,
    editImagePreview,
    handleEditImageChange,

    // Delete
    itemToDelete,
    setItemToDelete,
    isSavingId,
    setIsSavingId,
  };
}
