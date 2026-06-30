"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  getSubCategories,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
  getCategories,
} from "@/utils/admin-api";
import type { SubProductCategory, ProductCategory } from "@/types/product-category";
import DeleteConfirmModal from "@/components/seller-product/delete-confirm-modal";
import { useToast } from "@/hooks/use-toast";
import ToastContainer from "@/components/toast-container";

export default function AdminSubCategoriesPage() {
  const { toasts, addToast, removeToast } = useToast();

  const [categories, setCategories] = useState<SubProductCategory[]>([]);
  const [parentCategories, setParentCategories] = useState<ProductCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newCategoryId, setNewCategoryId] = useState<number | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<number | "">("");
  const [isSaving, setIsSaving] = useState(false);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    title: string;
  } | null>(null);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [subRes, parentRes] = await Promise.all([
        getSubCategories(),
        getCategories(),
      ]);
      if (subRes.status === "success") {
        setCategories(subRes.data ?? []);
      } else {
        setError(subRes.message || "Gagal memuat sub kategori");
      }
      if (parentRes.status === "success") {
        setParentCategories(parentRes.data ?? []);
      } else {
        console.warn("Gagal memuat kategori induk:", (parentRes as any).message);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "Gagal memuat sub kategori"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Resolve parent category name from sub-category
  const getParentName = useCallback(
    (cat: SubProductCategory): string => {
      // Backend returns product_categories as nested relation object
      if (cat.product_categories?.title) return cat.product_categories.title;
      return "-";
    },
    []
  );

  // Resolve parent category ID from sub-category (returns undefined if not set)
  function getParentId(cat: SubProductCategory): number | undefined {
    return cat.product_categories?.id;
  }

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  /* ──────────────────────────── Create ──────────────────────────── */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newTitle.trim();
    if (!trimmed || newCategoryId === "") return;

    setIsSubmitting(true);

    try {
      const res = await createSubCategory({ title: trimmed, sub_product_categories_id: newCategoryId as number });
      if (res.status === "success") {
        setNewTitle("");
        setNewCategoryId("");
        const createdTitle = res.data?.title ?? trimmed;
        const parentName = parentCategories.find((c) => c.id === newCategoryId)?.title ?? "";
        addToast(`Sub kategori "${createdTitle}" berhasil dibuat${parentName ? ` di kategori "${parentName}"` : ""}`, "success");
        await fetchCategories();
      } else {
        addToast(res.message || "Gagal membuat sub kategori", "error");
      }
    } catch (err: any) {
      addToast(
        err.response?.data?.message || err.message || "Gagal membuat sub kategori",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ──────────────────────────── Edit ──────────────────────────── */

  const startEdit = (cat: SubProductCategory) => {
    setEditingId(cat.id);
    setEditingTitle(cat.title);
    setEditingCategoryId(getParentId(cat) ?? "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingTitle("");
    setEditingCategoryId("");
  };

  const handleSaveEdit = async (id: number) => {
    const trimmed = editingTitle.trim();
    if (!trimmed) return;

    const currentCat = categories.find((c) => c.id === id);

    setIsSaving(true);
    try {
      const payload: { title?: string; sub_product_categories_id?: number } = {};
      if (trimmed !== (currentCat?.title ?? "")) {
        payload.title = trimmed;
      }
      if (editingCategoryId !== "" && editingCategoryId !== (getParentId(currentCat!) ?? "")) {
        payload.sub_product_categories_id = editingCategoryId as number;
      }
      // Always send at least one field
      if (!payload.title && payload.sub_product_categories_id === undefined) {
        payload.title = trimmed;
      }

      const res = await updateSubCategory(id, payload);
      if (res.status === "success") {
        setCategories((prev) =>
          prev.map((c) => {
            if (c.id === id) {
              return { ...c, title: trimmed };
            }
            return c;
          })
        );
        addToast(`Sub kategori berhasil diubah menjadi "${trimmed}"`, "success");
        await fetchCategories();
      } else {
        addToast(res.message || "Gagal mengubah sub kategori", "error");
      }
    } catch (err: any) {
      addToast(
        err.response?.data?.message || err.message || "Gagal mengubah sub kategori",
        "error"
      );
    } finally {
      setIsSaving(false);
      cancelEdit();
    }
  };

  /* ──────────────────────────── Delete ──────────────────────────── */

  const handleDelete = async (id: number) => {
    setIsSaving(true);
    try {
      const res = await deleteSubCategory(id);
      if (res.status === "success") {
        setCategories((prev) => prev.filter((c) => c.id !== id));
        addToast("Sub kategori berhasil dihapus", "success");
      } else {
        addToast(res.message || "Gagal menghapus sub kategori", "error");
      }
    } catch (err: any) {
      addToast(
        err.response?.data?.message || err.message || "Gagal menghapus sub kategori",
        "error"
      );
    } finally {
      setIsSaving(false);
      setDeleteTarget(null);
    }
  };

  /* ──────────────────────────── Render ──────────────────────────── */

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Page Header */}
      <div className="bg-white rounded-2xl p-6 shadow-soft border border-outline-variant/20">
        <h2 className="font-headline text-[24px] font-semibold text-on-surface mb-2">
          Sub Kategori Produk
        </h2>
        <p className="text-[14px] text-on-surface-variant">
          Kelola sub kategori produk yang tersedia di platform.
        </p>
      </div>

      {/* Create Sub Category Form */}
      <div className="bg-white rounded-2xl p-6 shadow-soft border border-outline-variant/20">
        <h3 className="font-headline text-[18px] font-semibold text-on-surface mb-4">
          Tambah Sub Kategori Baru
        </h3>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-3"
        >
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Nama sub kategori baru..."
            className="flex-1 bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-[14px] text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            disabled={isSubmitting}
          />
          <select
            value={newCategoryId}
            onChange={(e) => setNewCategoryId(e.target.value ? Number(e.target.value) : "")}
            className="bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-[14px] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all min-w-[200px]"
            disabled={isSubmitting}
          >
            <option value="">Pilih Kategori Induk...</option>
            {parentCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.title}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={isSubmitting || !newTitle.trim() || newCategoryId === ""}
            className="px-6 py-3 bg-primary text-white rounded-xl text-[14px] font-semibold hover:shadow-soft transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shrink-0"
          >
            {isSubmitting ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">
                  progress_activity
                </span>
                Menyimpan...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">add</span>
                Tambah Sub Kategori
              </>
            )}
          </button>
        </form>
      </div>

      {/* Sub Categories List */}
      <div className="bg-white rounded-2xl shadow-soft border border-outline-variant/20 overflow-hidden">
        <div className="p-6 border-b border-outline-variant/20">
          <h3 className="font-headline text-[18px] font-semibold text-on-surface">
            Daftar Sub Kategori
          </h3>
          <p className="text-[13px] text-on-surface-variant mt-1">
            {!isLoading && `${categories.length} sub kategori ditemukan`}
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="p-12 flex items-center justify-center">
            <span className="material-symbols-outlined text-[32px] text-primary animate-spin">
              progress_activity
            </span>
            <span className="ml-3 text-[14px] text-on-surface-variant">
              Memuat sub kategori...
            </span>
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="p-12 flex flex-col items-center justify-center">
            <span className="material-symbols-outlined text-[48px] text-error mb-3">
              error_outline
            </span>
            <p className="text-[14px] text-error font-medium mb-4">{error}</p>
            <button
              onClick={fetchCategories}
              className="px-4 py-2 bg-primary text-white rounded-xl text-[13px] font-semibold hover:shadow-soft transition-all"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && categories.length === 0 && (
          <div className="p-12 flex flex-col items-center justify-center">
            <span className="material-symbols-outlined text-[48px] text-on-surface-variant/40 mb-3">
              category
            </span>
            <p className="text-[14px] text-on-surface-variant font-medium mb-1">
              Belum ada sub kategori
            </p>
            <p className="text-[12px] text-on-surface-variant/60">
              Tambahkan sub kategori pertama Anda menggunakan form di atas.
            </p>
          </div>
        )}

        {/* Sub Categories Table */}
        {!isLoading && !error && categories.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-surface-container-low">
                  <th className="text-left px-6 py-3 text-[12px] font-semibold text-on-surface-variant tracking-wider uppercase">
                    #
                  </th>
                  <th className="text-left px-6 py-3 text-[12px] font-semibold text-on-surface-variant tracking-wider uppercase">
                    Nama Sub Kategori
                  </th>
                  <th className="text-left px-6 py-3 text-[12px] font-semibold text-on-surface-variant tracking-wider uppercase">
                    Kategori Induk
                  </th>
                  <th className="text-center px-6 py-3 text-[12px] font-semibold text-on-surface-variant tracking-wider uppercase">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {categories.map((cat, index) => (
                  <tr
                    key={cat.id}
                    className="hover:bg-surface-container-lowest transition-colors"
                  >
                    <td className="px-6 py-4 text-[13px] text-on-surface-variant">
                      {index + 1}
                    </td>

                    {/* Title: normal or inline edit */}
                    <td className="px-6 py-4">
                      {editingId === cat.id ? (
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          className="w-full bg-surface-container-low border border-primary/30 rounded-lg px-3 py-2 text-[14px] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveEdit(cat.id);
                            if (e.key === "Escape") cancelEdit();
                          }}
                        />
                      ) : (
                        <span className="text-[14px] font-medium text-on-surface">
                          {cat.title}
                        </span>
                      )}
                    </td>

                    {/* Parent Category: normal or inline edit */}
                    <td className="px-6 py-4">
                      {editingId === cat.id ? (
                        <select
                          value={editingCategoryId}
                          onChange={(e) => setEditingCategoryId(e.target.value ? Number(e.target.value) : "")}
                          className="w-full bg-surface-container-low border border-primary/30 rounded-lg px-3 py-2 text-[13px] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          <option value="">Pilih Kategori Induk...</option>
                          {parentCategories.map((pc) => (
                            <option key={pc.id} value={pc.id}>
                              {pc.title}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-[13px] text-on-surface-variant">
                          {getParentName(cat)}
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      {editingId === cat.id ? (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleSaveEdit(cat.id)}
                            disabled={isSaving}
                            className="p-2 text-primary hover:bg-primary-container/20 rounded-lg transition-all"
                            title="Simpan"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              check
                            </span>
                          </button>
                          <button
                            onClick={cancelEdit}
                            disabled={isSaving}
                            className="p-2 text-on-surface-variant hover:bg-surface-container rounded-lg transition-all"
                            title="Batal"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              close
                            </span>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => startEdit(cat)}
                            className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary-container/20 rounded-lg transition-all"
                            title="Edit sub kategori"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              edit
                            </span>
                          </button>
                          <button
                            onClick={() =>
                              setDeleteTarget({ id: cat.id, title: cat.title })
                            }
                            className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container/20 rounded-lg transition-all"
                            title="Hapus sub kategori"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              delete
                            </span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteTarget !== null}
        title="Hapus Sub Kategori"
        itemName={deleteTarget?.title ?? ""}
        description="Sub kategori"
        isDeleting={isSaving}
        onConfirm={() => {
          if (deleteTarget) handleDelete(deleteTarget.id);
        }}
        onCancel={() => setDeleteTarget(null)}
        confirmLabel="Hapus"
        confirmingLabel="Menghapus..."
        error={null}
      />
    </div>
  );
}
