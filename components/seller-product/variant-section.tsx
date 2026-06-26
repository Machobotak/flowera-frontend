"use client";

import React, { useRef } from "react";
import axios from "axios";
import type { VariantFormEntry } from "@/types/product";
import { useSubEntity } from "@/hooks/use-sub-entity";
import PriceInput from "./price-input";
import DeleteConfirmModal from "./delete-confirm-modal";

interface VariantSectionProps {
  /** Initial items to pre-populate (loaded from server in edit mode) */
  initialItems: VariantFormEntry[];
  /** Mutable ref updated whenever items change — parent reads for submit */
  itemsRef: React.MutableRefObject<VariantFormEntry[]>;
  productId: string | null;
  addToast: (msg: string, type: "error" | "success") => void;
}

/**
 * Variant management card: list, add form, inline edit, delete.
 * Owns its state via useSubEntity hook. Parent reads items via itemsRef.
 */
export default function VariantSection({
  initialItems,
  itemsRef,
  productId,
  addToast,
}: VariantSectionProps) {
  const sub = useSubEntity<VariantFormEntry>({ idPrefix: "var" });

  // Init from server data when it arrives (edit mode)
  // Guard against re-init: only set if hook items are still empty
  const didInit = React.useRef(false);
  React.useEffect(() => {
    if (!didInit.current && initialItems.length > 0) {
      sub.setItems(initialItems);
      didInit.current = true;
    }
  }, [initialItems, sub]);

  // Single-direction: keep ref updated for parent's submit handler
  React.useEffect(() => {
    itemsRef.current = sub.items;
  }, [sub.items, itemsRef]);

  // Shortcut to items for this component's own JSX
  const items = sub.items;

  // ─── Subtitle state (variant-specific) ───
  const [newSubtitle, setNewSubtitle] = React.useState("");
  const [editSubtitle, setEditSubtitle] = React.useState("");

  const variantImageInputRef = useRef<HTMLInputElement>(null);
  const editVariantImageInputRef = useRef<HTMLInputElement>(null);

  // ─── Add variant ───
  const addVariant = () => {
    if (!sub.newTitle.trim()) return;
    if (!sub.newPrice || parseInt(sub.newPrice) <= 0) return;
    sub.addItem({ sub_title: newSubtitle.trim() } as Partial<VariantFormEntry>);
    setNewSubtitle("");
  };

  // ─── Start edit ───
  const startEditVariant = (v: VariantFormEntry) => {
    sub.startEdit(v);
    setEditSubtitle(v.sub_title || "");
  };

  // ─── Save edit ───
  const saveEditVariant = async () => {
    const target = items.find((v) => v.localId === sub.editingId);
    if (!target) return;
    if (!sub.editTitle.trim()) return;
    if (!sub.editPrice || parseInt(sub.editPrice) <= 0) return;

    if (target.backendId) {
      sub.setIsSavingId(sub.editingId);
      try {
        // Update text fields (JSON)
        await axios.put(
          `/api/seller/product-variant/update/${target.backendId}`,
          {
            title: sub.editTitle.trim(),
            sub_title: editSubtitle.trim(),
            price: parseInt(sub.editPrice),
          },
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );

        // Upload new image if any (FormData)
        if (sub.editImage) {
          const fileFormData = new FormData();
          fileFormData.append("file", sub.editImage);
          await axios.put(
            `/api/seller/product-variant/update/${target.backendId}`,
            fileFormData,
            { withCredentials: true }
          );
        }
      } catch (err: any) {
        const msg =
          err.response?.data?.message || err.message || "Gagal memperbarui varian";
        addToast(msg, "error");
        sub.setIsSavingId(null);
        return;
      }
      sub.setIsSavingId(null);
    }

    sub.applyEdit({ sub_title: editSubtitle.trim() } as Partial<VariantFormEntry>);
  };

  // ─── Delete ───
  const confirmDeleteVariant = async () => {
    if (!sub.itemToDelete) return;
    const v = sub.itemToDelete;
    sub.setItemToDelete(null);

    if (v.backendId) {
      sub.setIsSavingId(v.localId);
      try {
        await axios.delete(
          `/api/seller/product-variant/delete/${v.backendId}`,
          { withCredentials: true }
        );
      } catch (err: any) {
        const msg =
          err.response?.data?.message || err.message || "Gagal menghapus varian";
        addToast(msg, "error");
        sub.setIsSavingId(null);
        return;
      }
      sub.setIsSavingId(null);
    }
    sub.removeItem(v.localId);
  };

  return (
    <>
      <DeleteConfirmModal
        isOpen={!!sub.itemToDelete}
        title="Hapus Varian?"
        itemName={sub.itemToDelete?.title || ""}
        description="Varian"
        isDeleting={sub.isSavingId === sub.itemToDelete?.localId}
        onConfirm={confirmDeleteVariant}
        onCancel={() => sub.setItemToDelete(null)}
      />

      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-soft border border-outline-variant/20">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-tertiary-container/50 flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px] text-tertiary">
              layers
            </span>
          </div>
          <div>
            <h3 className="text-[16px] font-bold text-on-surface">
              Varian Produk
            </h3>
            <p className="text-[12px] text-on-surface-variant">
              Tambahkan varian seperti ukuran atau warna yang berbeda
            </p>
          </div>
        </div>

        {/* Existing Variants List */}
        {items.length > 0 && (
          <div className="space-y-2 mb-5">
            {items.map((v) => {
              const isEditing = sub.editingId === v.localId;
              const isBusy = sub.isSavingId === v.localId;

              if (isEditing) {
                return (
                  <div
                    key={v.localId}
                    className="p-4 bg-surface-container-low rounded-xl border-2 border-primary/30 space-y-3"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[12px] font-semibold text-on-surface-variant">
                          Nama Varian <span className="text-error">*</span>
                        </label>
                        <input
                          type="text"
                          value={sub.editTitle}
                          onChange={(e) => sub.setEditTitle(e.target.value)}
                          className="w-full px-4 py-2.5 bg-white border border-outline-variant/30 rounded-xl text-[13px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[12px] font-semibold text-on-surface-variant">
                          Sub Judul
                        </label>
                        <input
                          type="text"
                          value={editSubtitle}
                          onChange={(e) => setEditSubtitle(e.target.value)}
                          className="w-full px-4 py-2.5 bg-white border border-outline-variant/30 rounded-xl text-[13px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                        />
                      </div>
                    </div>

                    <PriceInput
                      value={sub.editPrice}
                      onChange={(v) =>
                        sub.setEditPrice(v)
                      }
                      label="Harga"
                      required
                    />

                    {/* Edit variant image */}
                    <div className="space-y-1.5">
                      <label className="text-[12px] font-semibold text-on-surface-variant">
                        Foto Varian
                      </label>
                      {sub.editImagePreview ? (
                        <div className="flex items-center gap-3">
                          <img
                            src={sub.editImagePreview}
                            alt="Preview"
                            className="w-16 h-16 rounded-xl object-cover border border-outline-variant/30"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const prev = sub.editImage
                                ? sub.editImagePreview
                                : null;
                              sub.handleEditImageChange(null as any);
                              if (prev)
                                requestAnimationFrame(() =>
                                  URL.revokeObjectURL(prev)
                                );
                            }}
                            className="text-[12px] text-error hover:underline"
                          >
                            Hapus foto
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            editVariantImageInputRef.current?.click()
                          }
                          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-dashed border-outline-variant/40 rounded-xl text-[13px] text-on-surface-variant hover:border-primary/50 hover:text-primary transition-all"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            add_photo_alternate
                          </span>
                          Pilih Foto
                        </button>
                      )}
                      <input
                        ref={editVariantImageInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          sub.handleEditImageChange(file);
                          e.target.value = "";
                        }}
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={saveEditVariant}
                        disabled={!!isBusy}
                        className="px-4 py-2 bg-primary text-white rounded-lg text-[12px] font-semibold hover:shadow-float active:scale-[0.98] transition-all flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {isBusy ? (
                          <span className="material-symbols-outlined animate-spin text-[16px]">
                            progress_activity
                          </span>
                        ) : (
                          <span className="material-symbols-outlined text-[16px]">
                            save
                          </span>
                        )}
                        Simpan
                      </button>
                      <button
                        type="button"
                        onClick={sub.cancelEdit}
                        disabled={!!isBusy}
                        className="px-4 py-2 border border-outline-variant/40 text-on-surface rounded-lg text-[12px] font-semibold hover:bg-surface-container transition-all disabled:opacity-50"
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                );
              }

              // ═══════ View Mode ═══════
              return (
                <div
                  key={v.localId}
                  className="flex items-center gap-3 p-4 bg-surface-container-low rounded-xl border border-outline-variant/20 group"
                >
                  {v.imagePreview && (
                    <img
                      src={v.imagePreview}
                      alt={v.title}
                      className="w-12 h-12 rounded-lg object-cover border border-outline-variant/20 shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-on-surface truncate">
                      {v.title}
                    </p>
                    {v.sub_title && (
                      <p className="text-[12px] text-on-surface-variant truncate">
                        {v.sub_title}
                      </p>
                    )}
                    <p className="text-[13px] font-semibold text-primary mt-0.5">
                      Rp {parseInt(v.price).toLocaleString("id-ID")}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => startEditVariant(v)}
                      disabled={!!sub.isSavingId || !!sub.editingId}
                      className="w-8 h-8 rounded-lg bg-primary-container/50 hover:bg-primary-container flex items-center justify-center shrink-0 transition-colors disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-[18px] text-primary">
                        edit
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => sub.setItemToDelete(v)}
                      disabled={!!sub.isSavingId || !!sub.editingId}
                      className="w-8 h-8 rounded-lg bg-error-container/50 hover:bg-error-container flex items-center justify-center shrink-0 transition-colors disabled:opacity-50"
                    >
                      {isBusy ? (
                        <span className="material-symbols-outlined animate-spin text-[16px] text-error">
                          progress_activity
                        </span>
                      ) : (
                        <span className="material-symbols-outlined text-[18px] text-error">
                          close
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add Variant Form */}
        <div className="space-y-4 p-4 bg-surface-container-low rounded-xl border border-outline-variant/20">
          <p className="text-[13px] font-semibold text-on-surface-variant">
            Tambah Varian Baru
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-on-surface-variant">
                Nama Varian <span className="text-error">*</span>
              </label>
              <input
                type="text"
                value={sub.newTitle}
                onChange={(e) => sub.setNewTitle(e.target.value)}
                placeholder="Contoh: Ukuran M"
                className="w-full px-4 py-3 bg-white border border-outline-variant/30 rounded-xl text-[13px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-outline-variant outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-on-surface-variant">
                Sub Judul
              </label>
              <input
                type="text"
                value={newSubtitle}
                onChange={(e) => setNewSubtitle(e.target.value)}
                placeholder="Contoh: 10 Tangkai"
                className="w-full px-4 py-3 bg-white border border-outline-variant/30 rounded-xl text-[13px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-outline-variant outline-none"
              />
            </div>
          </div>

          {/* Variant Image */}
          <div className="space-y-1.5">
            <label className="text-[12px] font-semibold text-on-surface-variant">
              Foto Varian
            </label>
            {sub.newImagePreview ? (
              <div className="flex items-center gap-3">
                <img
                  src={sub.newImagePreview}
                  alt="Preview varian"
                  className="w-16 h-16 rounded-xl object-cover border border-outline-variant/30"
                />
                <button
                  type="button"
                  onClick={sub.clearNewImage}
                  className="text-[12px] text-error hover:underline"
                >
                  Hapus foto
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => variantImageInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-3 bg-white border border-dashed border-outline-variant/40 rounded-xl text-[13px] text-on-surface-variant hover:border-primary/50 hover:text-primary transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">
                  add_photo_alternate
                </span>
                Pilih Foto
              </button>
            )}
            <input
              ref={variantImageInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                sub.handleNewImageChange(file);
                e.target.value = "";
              }}
            />
          </div>

          <div className="flex items-end gap-3">
            <div className="flex-1">
              <PriceInput
                value={sub.newPrice}
                onChange={(v) =>
                  sub.setNewPrice(v)
                }
                label="Harga"
                required
              />
            </div>
            <button
              type="button"
              onClick={addVariant}
              className="px-5 py-3 bg-primary text-white rounded-xl text-[13px] font-semibold hover:shadow-float active:scale-[0.98] transition-all flex items-center gap-2 shrink-0"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Tambah
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
