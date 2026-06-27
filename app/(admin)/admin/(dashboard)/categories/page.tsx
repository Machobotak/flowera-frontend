"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/utils/admin-api";
import type { ProductCategory } from "@/types/product-category";
import DeleteConfirmModal from "@/components/seller-product/delete-confirm-modal";
import { useToast } from "@/hooks/use-toast";
import ToastContainer from "@/components/toast-container";

export default function AdminCategoriesPage() {
  const { toasts, addToast, removeToast } = useToast();

  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Delete state — stores the category to delete (id + title for modal)
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    title: string;
  } | null>(null);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getCategories();
      if (res.status === "success") {
        setCategories(res.data ?? []);
      } else {
        setError(res.message || "Gagal memuat kategori");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "Gagal memuat kategori"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  /* ──────────────────────────── Create ──────────────────────────── */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newTitle.trim();
    if (!trimmed) return;

    setIsSubmitting(true);

    try {
      const res = await createCategory({ title: trimmed });
      if (res.status === "success") {
        setNewTitle("");
        const createdTitle = res.data?.title ?? trimmed;
        addToast(`Kategori "${createdTitle}" berhasil dibuat`, "success");
        await fetchCategories();
      } else {
        addToast(res.message || "Gagal membuat kategori", "error");
      }
    } catch (err: any) {
      addToast(
        err.response?.data?.message || err.message || "Gagal membuat kategori",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ──────────────────────────── Edit ──────────────────────────── */

  const startEdit = (cat: ProductCategory) => {
    setEditingId(cat.id);
    setEditingTitle(cat.title);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingTitle("");
  };

  const handleSaveEdit = async (id: number) => {
    const trimmed = editingTitle.trim();
    if (!trimmed) return;

    setIsSaving(true);
    try {
      const res = await updateCategory(id, { title: trimmed });
      if (res.status === "success") {
        setCategories((prev) =>
          prev.map((c) => (c.id === id ? { ...c, title: trimmed } : c))
        );
        addToast(`Kategori berhasil diubah menjadi "${trimmed}"`, "success");
      } else {
        addToast(res.message || "Gagal mengubah kategori", "error");
      }
    } catch (err: any) {
      addToast(
        err.response?.data?.message || err.message || "Gagal mengubah kategori",
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
      const res = await deleteCategory(id);
      if (res.status === "success") {
        setCategories((prev) => prev.filter((c) => c.id !== id));
        addToast("Kategori berhasil dihapus", "success");
      } else {
        addToast(res.message || "Gagal menghapus kategori", "error");
      }
    } catch (err: any) {
      addToast(
        err.response?.data?.message || err.message || "Gagal menghapus kategori",
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
          Kategori Produk
        </h2>
        <p className="text-[14px] text-on-surface-variant">
          Kelola kategori produk yang tersedia di platform.
        </p>
      </div>

      {/* Create Category Form */}
      <div className="bg-white rounded-2xl p-6 shadow-soft border border-outline-variant/20">
        <h3 className="font-headline text-[18px] font-semibold text-on-surface mb-4">
          Tambah Kategori Baru
        </h3>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-3"
        >
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Nama kategori baru..."
            className="flex-1 bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-[14px] text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            disabled={isSubmitting}
          />
          <button
            type="submit"
            disabled={isSubmitting || !newTitle.trim()}
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
                Tambah Kategori
              </>
            )}
          </button>
        </form>
      </div>

      {/* Categories List */}
      <div className="bg-white rounded-2xl shadow-soft border border-outline-variant/20 overflow-hidden">
        <div className="p-6 border-b border-outline-variant/20">
          <h3 className="font-headline text-[18px] font-semibold text-on-surface">
            Daftar Kategori
          </h3>
          <p className="text-[13px] text-on-surface-variant mt-1">
            {!isLoading && `${categories.length} kategori ditemukan`}
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="p-12 flex items-center justify-center">
            <span className="material-symbols-outlined text-[32px] text-primary animate-spin">
              progress_activity
            </span>
            <span className="ml-3 text-[14px] text-on-surface-variant">
              Memuat kategori...
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
              Belum ada kategori
            </p>
            <p className="text-[12px] text-on-surface-variant/60">
              Tambahkan kategori pertama Anda menggunakan form di atas.
            </p>
          </div>
        )}

        {/* Categories Table */}
        {!isLoading && !error && categories.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-surface-container-low">
                  <th className="text-left px-6 py-3 text-[12px] font-semibold text-on-surface-variant tracking-wider uppercase">
                    #
                  </th>
                  <th className="text-left px-6 py-3 text-[12px] font-semibold text-on-surface-variant tracking-wider uppercase">
                    Nama Kategori
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
                            title="Edit kategori"
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
                            title="Hapus kategori"
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
        title="Hapus Kategori"
        itemName={deleteTarget?.title ?? ""}
        description="Kategori"
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
