"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import type { VariantFormEntry } from "@/types/product";

interface ImagePreview {
  id: string;
  backendId?: number; // real image ID from backend
  file?: File;        // only set for new uploads
  preview: string;   // object URL (new) or resolved URL (existing)
  isExisting?: boolean;
  isDefault?: boolean; // true if this is the default cover image
}

export default function ProductFormPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string; // "new" or numeric id string
  const isEditMode = productId !== "new";

  // ─── Form state ───
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [isLifeFlower, setIsLifeFlower] = useState(true);

  // ─── Variant state ───
  const [variants, setVariants] = useState<VariantFormEntry[]>([]);
  const [newVariantTitle, setNewVariantTitle] = useState("");
  const [newVariantSubtitle, setNewVariantSubtitle] = useState("");
  const [newVariantPrice, setNewVariantPrice] = useState("");

  // ─── Variant edit state ───
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);
  const [editVariantTitle, setEditVariantTitle] = useState("");
  const [editVariantSubtitle, setEditVariantSubtitle] = useState("");
  const [editVariantPrice, setEditVariantPrice] = useState("");
  const [isSavingVariant, setIsSavingVariant] = useState<string | null>(null); // localId of variant being saved/deleted

  // ─── Image state ───
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── Page state ───
  const [isLoadingProduct, setIsLoadingProduct] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStep, setSubmitStep] = useState<"idle" | "saving" | "uploading" | "setting_cover" | "creating_variants" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  // ─── Default cover state ───
  const [defaultImageId, setDefaultImageId] = useState<string | null>(null);
  const [settingCoverId, setSettingCoverId] = useState<string | null>(null);

  // ─── Load existing product on edit mode ───
  useEffect(() => {
    if (!isEditMode) return;
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`/api/seller/product`, { withCredentials: true });
        const all: any[] = res.data?.data || res.data || [];
        const found = all.find((p: any) => String(p.id) === productId);
        if (!found) throw new Error("Produk tidak ditemukan");

        setName(found.name || "");
        setPrice(String(found.price || ""));
        setDescription(found.description || "");
        setIsLifeFlower(found.isLifeFlower ?? true);

        // Load existing images as previews
        const existingImages = found.product_image || found.images || [];
        const baseUrl = process.env.NEXT_PUBLIC_ACCESS_FILE_STORAGE || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
        const resolved: ImagePreview[] = existingImages.map((img: any) => {
          const raw = img.image_url || img.url || img.path || (typeof img === "string" ? img : "");
          let previewUrl = raw;
          if (raw && !raw.startsWith("http")) {
            previewUrl = raw.startsWith("/") ? `${baseUrl}${raw}` : `${baseUrl}/${raw}`;
          }
          const imgId = img.id || Math.random();
          return {
            id: `existing-${imgId}`,
            backendId: typeof img.id === "number" ? img.id : parseInt(img.id) || undefined,
            preview: previewUrl,
            isExisting: true,
            isDefault: img.isDefault || img.is_default || false,
          };
        });
        setImages(resolved);

        // Track which image is the default cover
        const defaultImg = resolved.find((img) => img.isDefault);
        if (defaultImg) setDefaultImageId(defaultImg.id);

        // Load existing variants
        try {
          const detailRes = await axios.get(`/api/user/product/detail/${productId}`, { withCredentials: true });
          const detailData = detailRes.data?.data || detailRes.data || {};
          const existingVariants = detailData.product_variant || [];
          if (Array.isArray(existingVariants) && existingVariants.length > 0) {
            const mapped: VariantFormEntry[] = existingVariants.map((v: any) => ({
              localId: `existing-var-${v.id}`,
              title: v.title || v.name || "",
              sub_title: v.sub_title || "",
              price: String(v.price || ""),
              backendId: v.id,
            }));
            setVariants(mapped);
          }
        } catch {
          // Variant fetch is non-fatal — variants just won't pre-populate
        }
      } catch (err: any) {
        setError(err.message || "Gagal memuat data produk");
      } finally {
        setIsLoadingProduct(false);
      }
    };
    fetchProduct();
  }, [isEditMode, productId]);

  // ─── Image handling ───
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

  const removeImage = (id: string) => {
    setImages((prev) => {
      const removed = prev.find((img) => img.id === id);
      if (removed && !removed.isExisting && removed.file) URL.revokeObjectURL(removed.preview);
      return prev.filter((img) => img.id !== id);
    });
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (e.dataTransfer.files) addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  // ─── Price formatting ───
  const formatPrice = (value: string) =>
    value.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setPrice(e.target.value.replace(/\D/g, ""));

  // ─── Variant management ───
  const handleVariantPriceChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setNewVariantPrice(e.target.value.replace(/\D/g, ""));

  const addVariant = () => {
    if (!newVariantTitle.trim()) return;
    if (!newVariantPrice || parseInt(newVariantPrice) <= 0) return;
    const entry: VariantFormEntry = {
      localId: `var-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: newVariantTitle.trim(),
      sub_title: newVariantSubtitle.trim(),
      price: newVariantPrice,
    };
    setVariants((prev) => [...prev, entry]);
    setNewVariantTitle("");
    setNewVariantSubtitle("");
    setNewVariantPrice("");
  };

  const removeVariant = (localId: string) => {
    setVariants((prev) => prev.filter((v) => v.localId !== localId));
  };

  // ─── Variant edit & delete (server-aware) ───
  const startEditVariant = (v: VariantFormEntry) => {
    setEditingVariantId(v.localId);
    setEditVariantTitle(v.title);
    setEditVariantSubtitle(v.sub_title);
    setEditVariantPrice(v.price);
  };

  const cancelEditVariant = () => {
    setEditingVariantId(null);
    setEditVariantTitle("");
    setEditVariantSubtitle("");
    setEditVariantPrice("");
  };

  const saveEditVariant = async () => {
    if (!editingVariantId) return;
    if (!editVariantTitle.trim()) return;
    if (!editVariantPrice || parseInt(editVariantPrice) <= 0) return;

    const target = variants.find((v) => v.localId === editingVariantId);
    if (!target) return;

    const updatedTitle = editVariantTitle.trim();
    const updatedSubtitle = editVariantSubtitle.trim();
    const updatedPrice = editVariantPrice;

    // If variant already exists on server, call update API
    if (target.backendId) {
      setIsSavingVariant(editingVariantId);
      try {
        await axios.put(
          `/api/seller/product-variant/update/${target.backendId}`,
          {
            title: updatedTitle,
            sub_title: updatedSubtitle,
            price: parseInt(updatedPrice),
          },
          { withCredentials: true }
        );
      } catch (err: any) {
        const msg = err.response?.data?.message || err.message || "Gagal memperbarui varian";
        setError(msg);
        setIsSavingVariant(null);
        return;
      }
      setIsSavingVariant(null);
    }

    // Update local state
    setVariants((prev) =>
      prev.map((v) =>
        v.localId === editingVariantId
          ? { ...v, title: updatedTitle, sub_title: updatedSubtitle, price: updatedPrice }
          : v
      )
    );
    cancelEditVariant();
  };

  const deleteVariant = async (v: VariantFormEntry) => {
    // If variant exists on server, call delete API first
    if (v.backendId) {
      setIsSavingVariant(v.localId);
      try {
        await axios.delete(`/api/seller/product-variant/delete/${v.backendId}`, {
          withCredentials: true,
        });
      } catch (err: any) {
        const msg = err.response?.data?.message || err.message || "Gagal menghapus varian";
        setError(msg);
        setIsSavingVariant(null);
        return;
      }
      setIsSavingVariant(null);
    }
    removeVariant(v.localId);
  };

  const handleEditVariantPriceChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setEditVariantPrice(e.target.value.replace(/\D/g, ""));

  // ─── Set default cover image ───
  const setDefaultCover = async (img: ImagePreview) => {
    if (!img.backendId || settingCoverId) return;
    const pid = isEditMode ? parseInt(productId) : null;
    if (!pid) return;

    setSettingCoverId(img.id);
    try {
      await axios.post(
        `/api/seller/product/images/default/${img.backendId}`,
        { product_id: pid },
        { withCredentials: true }
      );
      // Update local state
      setDefaultImageId(img.id);
      setImages((prev) =>
        prev.map((i) => ({ ...i, isDefault: i.id === img.id }))
      );
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Gagal mengatur foto cover";
      setError(msg);
    } finally {
      setSettingCoverId(null);
    }
  };

  // ─── Submit ───
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) return setError("Nama produk harus diisi");
    if (!price || parseInt(price) <= 0) return setError("Harga produk harus lebih dari 0");

    setIsSubmitting(true);

    try {
      setSubmitStep("saving");

      let activeProductId: number;

      if (isEditMode) {
        // ── Update mode ──
        activeProductId = parseInt(productId);

        await axios.put(
          `/api/seller/product/update?product=${productId}`,
          {
            name: name.trim(),
            price: parseInt(price),
            description: description.trim() || undefined,
            isLifeFlower,
          },
          { withCredentials: true }
        );

        // Upload any NEW images (non-existing ones)
        const newImages = images.filter((img) => !img.isExisting && img.file);
        if (newImages.length > 0) {
          setSubmitStep("uploading");
          const formData = new FormData();
          newImages.forEach((img) => formData.append("files", img.file!));
          await axios.post(`/api/seller/product/${productId}/images`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
            withCredentials: true,
          });
        }
      } else {
        // ── Create mode ──
        const createRes = await axios.post(
          "/api/seller/product/create",
          {
            name: name.trim(),
            price: parseInt(price),
            description: description.trim() || undefined,
            isLifeFlower,
          },
          { withCredentials: true }
        );

        activeProductId = createRes.data?.data?.id || createRes.data?.id;
        if (!activeProductId) throw new Error("Gagal mendapatkan ID produk dari server");

        const newFiles = images.filter((img) => img.file);
        if (newFiles.length > 0) {
          setSubmitStep("uploading");
          const formData = new FormData();
          newFiles.forEach((img) => formData.append("files", img.file!));
          const uploadRes = await axios.post(`/api/seller/product/${activeProductId}/images`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
            withCredentials: true,
          });

          // Auto-set the first uploaded image as default cover
          setSubmitStep("setting_cover");
          const uploadedImages = uploadRes.data?.data || uploadRes.data?.images || [];
          if (uploadedImages.length > 0) {
            const firstImgId = uploadedImages[0].id;
            if (firstImgId) {
              try {
                await axios.post(
                  `/api/seller/product/images/default/${firstImgId}`,
                  { product_id: activeProductId },
                  { withCredentials: true }
                );
              } catch {
                // Non-fatal: product is created, cover just not set
                console.warn("Gagal mengatur foto cover default");
              }
            }
          }
        }
      }

      // ── Create new variants (applies to both create & edit mode) ──
      const variantsToCreate = variants.filter((v) => !v.backendId);
      if (variantsToCreate.length > 0) {
        setSubmitStep("creating_variants");
        for (const variant of variantsToCreate) {
          await axios.post(
            "/api/seller/product-variant/create",
            {
              title: variant.title,
              sub_title: variant.sub_title,
              price: parseInt(variant.price),
              product_id: activeProductId,
            },
            { withCredentials: true }
          );
        }
      }

      setSubmitStep("done");
      setTimeout(() => router.push("/store/products"), 1000);
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.message || "Gagal menyimpan produk. Silakan coba lagi.";
      setError(message);
      setSubmitStep("idle");
      setIsSubmitting(false);
    }
  };

  // ─── Mini progress components ───
  const StepIndicator = ({ label, status }: { label: string; status: "active" | "done" | "pending" }) => (
    <div
      className={`flex items-center gap-2 text-[12px] ${
        status === "active"
          ? "text-primary font-bold"
          : status === "done"
          ? "text-secondary"
          : "text-on-surface-variant"
      }`}
    >
      <span
        className="material-symbols-outlined text-[16px]"
        style={status === "done" ? { fontVariationSettings: "'FILL' 1" } : {}}
      >
        {status === "active" ? "pending" : status === "done" ? "check_circle" : "circle"}
      </span>
      {label}
    </div>
  );

  const StepDivider = ({ done }: { done: boolean }) => (
    <div className={`w-6 h-[2px] rounded-full ${done ? "bg-secondary" : "bg-outline-variant/30"}`} />
  );

  const getStepText = () => {
    switch (submitStep) {
      case "saving":
        return isEditMode ? "Menyimpan perubahan..." : "Membuat produk...";
      case "uploading":
        return "Mengunggah gambar...";
      case "setting_cover":
        return "Mengatur foto cover...";
      case "creating_variants":
        return "Menyimpan varian...";
      case "done":
        return "Berhasil! Mengalihkan...";
      default:
        return isEditMode ? "Simpan Perubahan" : "Tambah Produk";
    }
  };

  // ─── Loading skeleton ───
  if (isLoadingProduct) {
    return (
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-surface-container animate-pulse" />
          <div className="space-y-2">
            <div className="h-6 w-48 bg-surface-container rounded-lg animate-pulse" />
            <div className="h-4 w-64 bg-surface-container rounded-lg animate-pulse" />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-8 shadow-soft border border-outline-variant/20 space-y-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-24 bg-surface-container rounded animate-pulse" />
              <div className="h-12 bg-surface-container rounded-xl animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center hover:bg-surface-container-high transition-colors"
        >
          <span className="material-symbols-outlined text-[20px] text-on-surface-variant">
            arrow_back
          </span>
        </button>
        <div>
          <h2 className="font-headline font-bold text-[24px] text-on-surface">
            {isEditMode ? "Edit Produk" : "Tambah Produk Baru"}
          </h2>
          <p className="text-on-surface-variant text-[14px]">
            {isEditMode
              ? "Perbarui informasi produk bunga Anda"
              : "Lengkapi informasi produk bunga Anda"}
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-error-container rounded-xl border border-error/20 animate-[fadeIn_0.2s_ease]">
          <span className="material-symbols-outlined text-[20px] text-error mt-0.5">error</span>
          <div>
            <p className="text-[14px] font-semibold text-on-error-container">Terjadi Kesalahan</p>
            <p className="text-[13px] text-on-error-container/80">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="ml-auto">
            <span className="material-symbols-outlined text-[18px] text-on-error-container/60 hover:text-on-error-container">
              close
            </span>
          </button>
        </div>
      )}

      {/* Success Alert */}
      {submitStep === "done" && (
        <div className="flex items-center gap-3 p-4 bg-secondary-container rounded-xl border border-secondary/20 animate-[fadeIn_0.2s_ease]">
          <span
            className="material-symbols-outlined text-[20px] text-secondary"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            check_circle
          </span>
          <p className="text-[14px] font-semibold text-on-secondary-container">
            {isEditMode
              ? "Produk berhasil diperbarui! Mengalihkan ke daftar produk..."
              : "Produk berhasil ditambahkan! Mengalihkan ke daftar produk..."}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ─── Product Info Card ─── */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-soft border border-outline-variant/20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary-container/50 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px] text-primary">info</span>
            </div>
            <h3 className="text-[16px] font-bold text-on-surface">Informasi Produk</h3>
          </div>

          <div className="space-y-5">
            {/* Name */}
            <div className="space-y-2">
              <label htmlFor="product-name" className="text-[13px] font-semibold text-on-surface-variant">
                Nama Produk <span className="text-error">*</span>
              </label>
              <input
                id="product-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Buket Mawar Merah Premium"
                className="w-full px-5 py-4 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[14px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-outline-variant outline-none"
              />
            </div>

            {/* Price */}
            <div className="space-y-2">
              <label htmlFor="product-price" className="text-[13px] font-semibold text-on-surface-variant">
                Harga <span className="text-error">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[14px] font-semibold text-on-surface-variant">
                  Rp
                </span>
                <input
                  id="product-price"
                  type="text"
                  inputMode="numeric"
                  required
                  value={price ? formatPrice(price) : ""}
                  onChange={handlePriceChange}
                  placeholder="0"
                  className="w-full pl-12 pr-5 py-4 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[14px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-outline-variant outline-none"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label htmlFor="product-description" className="text-[13px] font-semibold text-on-surface-variant">
                Deskripsi Produk
              </label>
              <textarea
                id="product-description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Jelaskan detail produk bunga Anda, seperti jenis bunga, ukuran, atau perawatan khusus..."
                className="w-full px-5 py-4 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[14px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-outline-variant resize-none outline-none"
              />
            </div>

            {/* isLifeFlower Toggle */}
            <div className="space-y-3">
              <label className="text-[13px] font-semibold text-on-surface-variant">
                Jenis Bunga <span className="text-error">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIsLifeFlower(true)}
                  className={`relative flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                    isLifeFlower
                      ? "border-primary bg-primary-container/20 shadow-sm"
                      : "border-outline-variant/30 bg-surface-container-low hover:border-outline-variant/50"
                  }`}
                >
                  {isLifeFlower && (
                    <div className="absolute top-3 right-3">
                      <span
                        className="material-symbols-outlined text-[18px] text-primary"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        check_circle
                      </span>
                    </div>
                  )}
                  <div className="w-12 h-12 rounded-xl bg-secondary-container/50 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[24px] text-secondary">eco</span>
                  </div>
                  <div className="text-left">
                    <p className={`text-[14px] font-bold ${isLifeFlower ? "text-primary" : "text-on-surface"}`}>
                      Bunga Asli
                    </p>
                    <p className="text-[12px] text-on-surface-variant">Fresh flowers</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setIsLifeFlower(false)}
                  className={`relative flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                    !isLifeFlower
                      ? "border-primary bg-primary-container/20 shadow-sm"
                      : "border-outline-variant/30 bg-surface-container-low hover:border-outline-variant/50"
                  }`}
                >
                  {!isLifeFlower && (
                    <div className="absolute top-3 right-3">
                      <span
                        className="material-symbols-outlined text-[18px] text-primary"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        check_circle
                      </span>
                    </div>
                  )}
                  <div className="w-12 h-12 rounded-xl bg-tertiary-container/50 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[24px] text-tertiary">potted_plant</span>
                  </div>
                  <div className="text-left">
                    <p className={`text-[14px] font-bold ${!isLifeFlower ? "text-primary" : "text-on-surface"}`}>
                      Bunga Artifisial
                    </p>
                    <p className="text-[12px] text-on-surface-variant">Artificial flowers</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Variant Card ─── */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-soft border border-outline-variant/20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-tertiary-container/50 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px] text-tertiary">layers</span>
            </div>
            <div>
              <h3 className="text-[16px] font-bold text-on-surface">Varian Produk</h3>
              <p className="text-[12px] text-on-surface-variant">
                Tambahkan varian seperti ukuran atau warna yang berbeda
              </p>
            </div>
          </div>

          {/* Existing Variants List */}
          {variants.length > 0 && (
            <div className="space-y-2 mb-5">
              {variants.map((v) => {
                const isEditing = editingVariantId === v.localId;
                const isBusy = isSavingVariant === v.localId;

                if (isEditing) {
                  // ═══════ Edit Mode ═══════
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
                            value={editVariantTitle}
                            onChange={(e) => setEditVariantTitle(e.target.value)}
                            className="w-full px-4 py-2.5 bg-white border border-outline-variant/30 rounded-xl text-[13px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[12px] font-semibold text-on-surface-variant">
                            Sub Judul
                          </label>
                          <input
                            type="text"
                            value={editVariantSubtitle}
                            onChange={(e) => setEditVariantSubtitle(e.target.value)}
                            className="w-full px-4 py-2.5 bg-white border border-outline-variant/30 rounded-xl text-[13px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                          />
                        </div>
                      </div>
                      <div className="flex items-end gap-3">
                        <div className="flex-1 space-y-1.5">
                          <label className="text-[12px] font-semibold text-on-surface-variant">
                            Harga <span className="text-error">*</span>
                          </label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[13px] font-semibold text-on-surface-variant">
                              Rp
                            </span>
                            <input
                              type="text"
                              inputMode="numeric"
                              value={editVariantPrice ? parseInt(editVariantPrice).toLocaleString("id-ID") : ""}
                              onChange={handleEditVariantPriceChange}
                              className="w-full pl-11 pr-4 py-2.5 bg-white border border-outline-variant/30 rounded-xl text-[13px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={saveEditVariant}
                          disabled={!!isBusy}
                          className="px-4 py-2 bg-primary text-white rounded-lg text-[12px] font-semibold hover:shadow-float active:scale-[0.98] transition-all flex items-center gap-1.5 disabled:opacity-50"
                        >
                          {isBusy ? (
                            <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
                          ) : (
                            <span className="material-symbols-outlined text-[16px]">save</span>
                          )}
                          Simpan
                        </button>
                        <button
                          type="button"
                          onClick={cancelEditVariant}
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
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold text-on-surface truncate">{v.title}</p>
                      {v.sub_title && (
                        <p className="text-[12px] text-on-surface-variant truncate">{v.sub_title}</p>
                      )}
                      <p className="text-[13px] font-semibold text-primary mt-0.5">
                        Rp {parseInt(v.price).toLocaleString("id-ID")}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => startEditVariant(v)}
                        disabled={!!isSavingVariant || !!editingVariantId}
                        className="w-8 h-8 rounded-lg bg-primary-container/50 hover:bg-primary-container flex items-center justify-center shrink-0 transition-colors disabled:opacity-50"
                      >
                        <span className="material-symbols-outlined text-[18px] text-primary">edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteVariant(v)}
                        disabled={!!isSavingVariant || !!editingVariantId}
                        className="w-8 h-8 rounded-lg bg-error-container/50 hover:bg-error-container flex items-center justify-center shrink-0 transition-colors disabled:opacity-50"
                      >
                        {isBusy ? (
                          <span className="material-symbols-outlined animate-spin text-[16px] text-error">progress_activity</span>
                        ) : (
                          <span className="material-symbols-outlined text-[18px] text-error">close</span>
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
            <p className="text-[13px] font-semibold text-on-surface-variant">Tambah Varian Baru</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[12px] font-semibold text-on-surface-variant">
                  Nama Varian <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  value={newVariantTitle}
                  onChange={(e) => setNewVariantTitle(e.target.value)}
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
                  value={newVariantSubtitle}
                  onChange={(e) => setNewVariantSubtitle(e.target.value)}
                  placeholder="Contoh: 10 Tangkai"
                  className="w-full px-4 py-3 bg-white border border-outline-variant/30 rounded-xl text-[13px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-outline-variant outline-none"
                />
              </div>
            </div>

            <div className="flex items-end gap-3">
              <div className="flex-1 space-y-1.5">
                <label className="text-[12px] font-semibold text-on-surface-variant">
                  Harga <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[13px] font-semibold text-on-surface-variant">
                    Rp
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={newVariantPrice ? parseInt(newVariantPrice).toLocaleString("id-ID") : ""}
                    onChange={handleVariantPriceChange}
                    placeholder="0"
                    className="w-full pl-11 pr-4 py-3 bg-white border border-outline-variant/30 rounded-xl text-[13px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-outline-variant outline-none"
                  />
                </div>
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

        {/* ─── Image Upload Card ─── */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-soft border border-outline-variant/20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-container/50 flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px] text-primary">image</span>
              </div>
              <div>
                <h3 className="text-[16px] font-bold text-on-surface">Foto Produk</h3>
                <p className="text-[12px] text-on-surface-variant">
                  {isEditMode
                    ? "Foto lama tetap tersimpan. Tambah foto baru jika diperlukan."
                    : "Maks. 5 foto, format JPG/PNG/WebP"}
                </p>
              </div>
            </div>
            <span className="text-[13px] font-semibold text-on-surface-variant">{images.length}/5</span>
          </div>

          {/* Drag & Drop Zone */}
          {images.length < 5 && (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
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
                  if (e.target.files) addFiles(e.target.files);
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
                    <span className="text-primary font-semibold hover:underline">pilih dari perangkat</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Image Previews */}
          {images.length > 0 && (
            <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 ${images.length < 5 ? "mt-4" : ""}`}>
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

                    {/* Badge: Cover / Tersimpan */}
                    {isCover && (
                      <div className="absolute top-2 left-2 px-2 py-0.5 bg-primary text-white text-[10px] font-bold rounded-md flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        Cover
                      </div>
                    )}
                    {img.isExisting && !isCover && (
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/50 text-white text-[10px] font-bold rounded-md">
                        Tersimpan
                      </div>
                    )}

                    {/* Set as Cover button (only for existing images in edit mode) */}
                    {img.isExisting && img.backendId && !isCover && isEditMode && (
                      <button
                        type="button"
                        onClick={() => setDefaultCover(img)}
                        disabled={!!settingCoverId}
                        className="absolute bottom-2 left-2 px-2 py-1 bg-white/90 hover:bg-white text-primary text-[10px] font-bold rounded-md opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1 disabled:opacity-50"
                      >
                        {isSettingThis ? (
                          <>
                            <span className="material-symbols-outlined animate-spin text-[12px]">progress_activity</span>
                            Mengatur...
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-[12px]">photo_camera_front</span>
                            Jadikan Cover
                          </>
                        )}
                      </button>
                    )}

                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => removeImage(img.id)}
                      className="absolute top-2 right-2 w-7 h-7 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                    >
                      <span className="material-symbols-outlined text-[16px] text-error">close</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {images.length === 0 && (
            <p className="text-[12px] text-on-surface-variant text-center mt-3 opacity-60">
              Foto pertama yang diunggah akan menjadi foto utama produk
            </p>
          )}
        </div>

        {/* ─── Submit Section ─── */}
        <div className="bg-white rounded-2xl p-6 shadow-soft border border-outline-variant/20">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 py-3.5 border border-outline-variant/40 text-on-surface font-semibold text-[14px] rounded-xl hover:bg-surface-container transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || submitStep === "done"}
              className={`w-full sm:flex-1 py-3.5 rounded-xl text-[14px] font-semibold text-white shadow-soft transition-all flex items-center justify-center gap-2 ${
                isSubmitting || submitStep === "done"
                  ? "bg-primary/60 cursor-not-allowed"
                  : "bg-primary hover:shadow-float active:scale-[0.98]"
              }`}
            >
              {isSubmitting || submitStep === "done" ? (
                <>
                  {submitStep === "done" ? (
                    <span
                      className="material-symbols-outlined text-[20px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      check_circle
                    </span>
                  ) : (
                    <span className="material-symbols-outlined animate-spin text-[20px]">
                      progress_activity
                    </span>
                  )}
                  {getStepText()}
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">
                    {isEditMode ? "save" : "add"}
                  </span>
                  {isEditMode ? "Simpan Perubahan" : "Tambah Produk"}
                </>
              )}
            </button>
          </div>

          {/* Progress steps indicator */}
          {isSubmitting && (
            <div className="flex items-center justify-center gap-2 md:gap-4 mt-4 pt-4 border-t border-outline-variant/20 flex-wrap">
              {/* Step 1: Save Product */}
              <StepIndicator
                label={isEditMode ? "Simpan Data" : "Buat Produk"}
                status={
                  submitStep === "saving"
                    ? "active"
                    : submitStep === "idle"
                    ? "pending"
                    : "done"
                }
              />
              <StepDivider done={submitStep !== "saving" && submitStep !== "idle"} />
              {/* Step 2: Upload Foto */}
              <StepIndicator
                label="Upload Foto"
                status={
                  submitStep === "uploading"
                    ? "active"
                    : submitStep === "saving" || submitStep === "idle"
                    ? "pending"
                    : "done"
                }
              />
              <StepDivider done={submitStep === "creating_variants" || submitStep === "done"} />
              {/* Step 3: Varian */}
              <StepIndicator
                label="Varian"
                status={
                  submitStep === "creating_variants"
                    ? "active"
                    : submitStep === "done"
                    ? "done"
                    : "pending"
                }
              />
              <StepDivider done={submitStep === "done"} />
              {/* Step 4: Selesai */}
              <StepIndicator
                label="Selesai"
                status={submitStep === "done" ? "active" : "pending"}
              />
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
