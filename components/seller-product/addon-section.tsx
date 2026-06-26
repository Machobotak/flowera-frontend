"use client";

import React, { useRef } from "react";
import axios from "axios";
import type { AddonFormEntry } from "@/types/product";
import { useSubEntity } from "@/hooks/use-sub-entity";
import PriceInput from "./price-input";
import DeleteConfirmModal from "./delete-confirm-modal";

interface AddonSectionProps {
  /** Initial items to pre-populate (loaded from server in edit mode) */
  initialItems: AddonFormEntry[];
  /** Mutable ref updated whenever items change — parent reads for submit */
  itemsRef: React.MutableRefObject<AddonFormEntry[]>;
  productId: string | null;
  addToast: (msg: string, type: "error" | "success") => void;
}

/**
 * Addon management card: list, add form, inline edit, delete.
 * Owns its state via useSubEntity hook. Parent reads items via itemsRef.
 */
export default function AddonSection({
  initialItems,
  itemsRef,
  productId,
  addToast,
}: AddonSectionProps) {
  const sub = useSubEntity<AddonFormEntry>({ idPrefix: "addon" });

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

  const addonImageInputRef = useRef<HTMLInputElement>(null);
  const editAddonImageInputRef = useRef<HTMLInputElement>(null);

  // ─── Add addon ───
  const addAddon = () => {
    if (!sub.newTitle.trim()) return;
    if (!sub.newPrice || parseInt(sub.newPrice) <= 0) return;
    sub.addItem();
  };

  // ─── Save edit ───
  const saveEditAddon = async () => {
    const target = items.find((a) => a.localId === sub.editingId);
    if (!target) return;
    if (!sub.editTitle.trim()) return;
    if (!sub.editPrice || parseInt(sub.editPrice) <= 0) return;

    if (target.backendId) {
      sub.setIsSavingId(sub.editingId);
      try {
        // Send all fields as FormData in a single request
        const formData = new FormData();
        formData.append("title", sub.editTitle.trim());
        formData.append("price", sub.editPrice);
        if (sub.editImage) {
          formData.append("file", sub.editImage);
        }
        await axios.put(
          `/api/seller/addon-product/update/${target.backendId}`,
          formData,
          { withCredentials: true }
        );
      } catch (err: any) {
        const msg =
          err.response?.data?.message || err.message || "Gagal memperbarui addon";
        addToast(msg, "error");
        sub.setIsSavingId(null);
        return;
      }
      sub.setIsSavingId(null);
    }

    sub.applyEdit();
  };

  // ─── Delete ───
  const confirmDeleteAddon = async () => {
    if (!sub.itemToDelete) return;
    const a = sub.itemToDelete;
    sub.setItemToDelete(null);

    if (a.backendId) {
      sub.setIsSavingId(a.localId);
      try {
        await axios.delete(
          `/api/seller/addon-product/delete/${a.backendId}`,
          { withCredentials: true }
        );
      } catch (err: any) {
        const msg =
          err.response?.data?.message || err.message || "Gagal menghapus addon";
        addToast(msg, "error");
        sub.setIsSavingId(null);
        return;
      }
      sub.setIsSavingId(null);
    }
    sub.removeItem(a.localId);
  };

  return (
    <>
      <DeleteConfirmModal
        isOpen={!!sub.itemToDelete}
        title="Hapus Addon?"
        itemName={sub.itemToDelete?.title || ""}
        description="Addon"
        isDeleting={sub.isSavingId === sub.itemToDelete?.localId}
        onConfirm={confirmDeleteAddon}
        onCancel={() => sub.setItemToDelete(null)}
      />

      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-soft border border-outline-variant/20">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-secondary-container/50 flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px] text-secondary">
              add_circle
            </span>
          </div>
          <div>
            <h3 className="text-[16px] font-bold text-on-surface">
              Addon Produk
            </h3>
            <p className="text-[12px] text-on-surface-variant">
              Tambahkan addon seperti kartu ucapan, pita, atau aksesoris tambahan
            </p>
          </div>
        </div>

        {/* Existing Addons List */}
        {items.length > 0 && (
          <div className="space-y-2 mb-5">
            {items.map((a) => {
              const isEditing = sub.editingId === a.localId;
              const isBusy = sub.isSavingId === a.localId;

              if (isEditing) {
                return (
                  <div
                    key={a.localId}
                    className="p-4 bg-surface-container-low rounded-xl border-2 border-primary/30 space-y-3"
                  >
                    <div className="space-y-1.5">
                      <label className="text-[12px] font-semibold text-on-surface-variant">
                        Nama Addon <span className="text-error">*</span>
                      </label>
                      <input
                        type="text"
                        value={sub.editTitle}
                        onChange={(e) => sub.setEditTitle(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-outline-variant/30 rounded-xl text-[13px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                      />
                    </div>

                    <PriceInput
                      value={sub.editPrice}
                      onChange={(v) =>
                        sub.setEditPrice(v)
                      }
                      label="Harga"
                      required
                    />

                    {/* Edit addon image */}
                    <div className="space-y-1.5">
                      <label className="text-[12px] font-semibold text-on-surface-variant">
                        Foto Addon
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
                            editAddonImageInputRef.current?.click()
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
                        ref={editAddonImageInputRef}
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
                        onClick={saveEditAddon}
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
                  key={a.localId}
                  className="flex items-center gap-3 p-4 bg-surface-container-low rounded-xl border border-outline-variant/20 group"
                >
                  {a.imagePreview && (
                    <img
                      src={a.imagePreview}
                      alt={a.title}
                      className="w-12 h-12 rounded-lg object-cover border border-outline-variant/20 shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-on-surface truncate">
                      {a.title}
                    </p>
                    <p className="text-[13px] font-semibold text-primary mt-0.5">
                      Rp {parseInt(a.price).toLocaleString("id-ID")}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => sub.startEdit(a)}
                      disabled={!!sub.isSavingId || !!sub.editingId}
                      className="w-8 h-8 rounded-lg bg-primary-container/50 hover:bg-primary-container flex items-center justify-center shrink-0 transition-colors disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-[18px] text-primary">
                        edit
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => sub.setItemToDelete(a)}
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

        {/* Add Addon Form */}
        <div className="space-y-4 p-4 bg-surface-container-low rounded-xl border border-outline-variant/20">
          <p className="text-[13px] font-semibold text-on-surface-variant">
            Tambah Addon Baru
          </p>

          <div className="space-y-1.5">
            <label className="text-[12px] font-semibold text-on-surface-variant">
              Nama Addon <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={sub.newTitle}
              onChange={(e) => sub.setNewTitle(e.target.value)}
              placeholder="Contoh: Kartu Ucapan"
              className="w-full px-4 py-3 bg-white border border-outline-variant/30 rounded-xl text-[13px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-outline-variant outline-none"
            />
          </div>

          {/* Addon Image */}
          <div className="space-y-1.5">
            <label className="text-[12px] font-semibold text-on-surface-variant">
              Foto Addon
            </label>
            {sub.newImagePreview ? (
              <div className="flex items-center gap-3">
                <img
                  src={sub.newImagePreview}
                  alt="Preview addon"
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
                onClick={() => addonImageInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-3 bg-white border border-dashed border-outline-variant/40 rounded-xl text-[13px] text-on-surface-variant hover:border-primary/50 hover:text-primary transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">
                  add_photo_alternate
                </span>
                Pilih Foto
              </button>
            )}
            <input
              ref={addonImageInputRef}
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
              onClick={addAddon}
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
