"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import ToastContainer from "@/components/toast-container";

// ─── Delete Confirmation Modal ───
function DeleteModal({
  product,
  onConfirm,
  onCancel,
  isDeleting,
  deleteError,
}: {
  product: any;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
  deleteError: string | null;
}) {
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
            <h3 className="text-[18px] font-bold text-on-surface">Hapus Produk?</h3>
            <p className="text-[13px] text-on-surface-variant mt-1">
              Produk{" "}
              <span className="font-semibold text-on-surface">"{product.name}"</span>{" "}
              akan dihapus secara permanen dan tidak bisa dikembalikan.
            </p>
          </div>

          {/* Error message inside modal */}
          {deleteError && (
            <div className="w-full flex items-start gap-2 p-3 bg-error-container rounded-xl text-left">
              <span className="material-symbols-outlined text-[18px] text-error shrink-0 mt-0.5">error</span>
              <p className="text-[12px] text-on-error-container">{deleteError}</p>
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
                  <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                  Menghapus...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                  {deleteError ? "Coba Lagi" : "Hapus"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StoreProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Toast
  const { toasts, addToast, removeToast } = useToast();

  // Delete modal state
  const [productToDelete, setProductToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("/api/seller/product", { withCredentials: true });
        setProducts(res.data?.data || res.data || []);
      } catch (error) {
        console.error("Gagal mengambil data produk", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const openDeleteModal = (product: any) => {
    setDeleteError(null);  // reset error setiap kali modal dibuka
    setProductToDelete(product);
  };

  const closeDeleteModal = () => {
    if (isDeleting) return;
    setProductToDelete(null);
    setDeleteError(null);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await axios.delete(`/api/seller/product/delete?product=${productToDelete.id}`, {
        withCredentials: true,
      });
      // Berhasil: update state dan tutup modal
      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
      setProductToDelete(null);
      setDeleteError(null);
      addToast(`Produk "${productToDelete.name}" berhasil dihapus`, "success");
    } catch (err: any) {
      // Gagal: tampilkan error di dalam modal, jangan tutup
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Gagal menghapus produk. Silakan coba lagi.";
      setDeleteError(msg);
      console.error("Gagal menghapus produk:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const getImageUrl = (product: any) => {
    const images = product.product_image || product.images;
    if (images && images.length > 0) {
      // Prioritaskan gambar yang di-set sebagai default cover
      const img = images.find((i: any) => i.isDefault || i.is_default) || images[0];
      const url = img.image_url || img.url || img.path || (typeof img === "string" ? img : null);
      if (url) {
        if (url.startsWith("http")) return url;
        const baseUrl = process.env.NEXT_PUBLIC_ACCESS_FILE_STORAGE || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
        return url.startsWith("/") ? `${baseUrl}${url}` : `${baseUrl}/${url}`;
      }
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name || "P")}&background=8c4a5c&color=fff`;
  };

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <DeleteModal
          product={productToDelete}
          onConfirm={confirmDelete}
          onCancel={closeDeleteModal}
          isDeleting={isDeleting}
          deleteError={deleteError}
        />
      )}

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-headline text-[24px] font-semibold text-on-surface">Produk Saya</h2>
          <Link
            href="/store/products/new"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-[13px] font-semibold hover:shadow-soft transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Tambah Produk
          </Link>
        </div>

        {isLoading ? (
          <div className="col-span-full py-16 text-center text-on-surface-variant bg-white rounded-2xl shadow-soft border border-outline-variant/20">
            <span className="material-symbols-outlined text-[48px] mb-2 animate-spin">progress_activity</span>
            <p className="text-[14px]">Memuat produk...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.length === 0 ? (
              <div className="col-span-full py-16 text-center bg-white rounded-2xl shadow-soft border border-outline-variant/20">
                <span className="material-symbols-outlined text-[56px] mb-3 text-outline/40">inventory_2</span>
                <p className="text-[16px] font-semibold text-on-surface mb-1">Belum ada produk</p>
                <p className="text-[13px] text-on-surface-variant mb-6">
                  Mulai tambahkan produk bunga pertama Anda
                </p>
                <Link
                  href="/store/products/new"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl text-[13px] font-semibold hover:shadow-soft transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  Tambah Produk Pertama
                </Link>
              </div>
            ) : (
              products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-soft border border-outline-variant/20 group flex flex-col"
                >
                  {/* Thumbnail */}
                  <div className="h-48 overflow-hidden relative bg-surface-container">
                    <img
                      src={getImageUrl(product)}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Life flower badge */}
                    <div className="absolute top-3 left-3">
                      <span
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                          product.isLifeFlower
                            ? "bg-secondary-container text-on-secondary-container"
                            : "bg-tertiary-container text-on-tertiary-container"
                        }`}
                      >
                        {product.isLifeFlower ? "🌸 Bunga Asli" : "🌿 Artifisial"}
                      </span>
                    </div>

                    {/* Action buttons (show on hover) */}
                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <Link
                        href={`/store/products/${product.id}`}
                        className="w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-all"
                        title="Edit Produk"
                      >
                        <span className="material-symbols-outlined text-[16px] text-primary">edit</span>
                      </Link>
                      <button
                        onClick={() => openDeleteModal(product)}
                        className="w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-all"
                        title="Hapus Produk"
                      >
                        <span className="material-symbols-outlined text-[16px] text-error">delete</span>
                      </button>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-semibold text-on-surface text-[15px] mb-1 truncate">{product.name}</h3>
                    {product.description && (
                      <p className="text-[12px] text-on-surface-variant mb-2 line-clamp-2">{product.description}</p>
                    )}
                    <p className="text-primary font-bold text-[14px] mb-3">
                      Rp{" "}
                      {typeof product.price === "number"
                        ? product.price.toLocaleString("id-ID")
                        : product.price}
                    </p>

                    {/* Bottom actions */}
                    <div className="flex items-center gap-2 mt-auto pt-3 border-t border-outline-variant/20">
                      <Link
                        href={`/store/products/${product.id}`}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-primary-container/40 text-primary rounded-xl text-[12px] font-semibold hover:bg-primary-container/70 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                        Edit
                      </Link>
                      <button
                        onClick={() => openDeleteModal(product)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-error-container/40 text-error rounded-xl text-[12px] font-semibold hover:bg-error-container/70 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </>
  );
}
