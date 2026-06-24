"use client";

import React, { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

interface ImagePreview {
  id: string;
  file: File;
  preview: string;
}

export default function CreateProductPage() {
  const router = useRouter();

  // Form state
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [isLifeFlower, setIsLifeFlower] = useState(true);

  // Image state
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Submit state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStep, setSubmitStep] = useState<"idle" | "creating" | "uploading" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  // ─── Image Handling ───

  const addFiles = useCallback((files: FileList | File[]) => {
    const newImages: ImagePreview[] = [];
    const fileArray = Array.from(files);

    for (const file of fileArray) {
      if (!file.type.startsWith("image/")) continue;
      if (images.length + newImages.length >= 5) break; // Max 5 images

      newImages.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        file,
        preview: URL.createObjectURL(file),
      });
    }

    setImages((prev) => [...prev, ...newImages]);
  }, [images.length]);

  const removeImage = (id: string) => {
    setImages((prev) => {
      const removed = prev.find((img) => img.id === id);
      if (removed) URL.revokeObjectURL(removed.preview);
      return prev.filter((img) => img.id !== id);
    });
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (e.dataTransfer.files) {
        addFiles(e.dataTransfer.files);
      }
    },
    [addFiles]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  // ─── Price Formatting ───

  const formatPrice = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    setPrice(raw);
  };

  // ─── Submit ───

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Nama produk harus diisi");
      return;
    }
    if (!price || parseInt(price) <= 0) {
      setError("Harga produk harus lebih dari 0");
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: Create the product
      setSubmitStep("creating");
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

      const productId = createRes.data?.data?.id || createRes.data?.id;

      if (!productId) {
        throw new Error("Gagal mendapatkan ID produk dari server");
      }

      // Step 2: Upload images (if any)
      if (images.length > 0) {
        setSubmitStep("uploading");
        const formData = new FormData();
        images.forEach((img) => {
          formData.append("files", img.file);
        });

        await axios.post(`/api/seller/product/${productId}/images`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        });
      }

      setSubmitStep("done");

      // Redirect to products list after short delay
      setTimeout(() => {
        router.push("/store/products");
      }, 1000);
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.message || "Gagal membuat produk. Silakan coba lagi.";
      setError(message);
      setSubmitStep("idle");
    } finally {
      if (submitStep !== "done") {
        setIsSubmitting(false);
      }
    }
  };

  // ─── Step indicator text ───

  const getStepText = () => {
    switch (submitStep) {
      case "creating":
        return "Membuat produk...";
      case "uploading":
        return "Mengunggah gambar...";
      case "done":
        return "Berhasil! Mengalihkan...";
      default:
        return "Tambah Produk";
    }
  };

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
          <h2 className="font-headline font-bold text-[24px] text-on-surface">Tambah Produk Baru</h2>
          <p className="text-on-surface-variant text-[14px]">
            Lengkapi informasi produk bunga Anda
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
          <span className="material-symbols-outlined text-[20px] text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
            check_circle
          </span>
          <p className="text-[14px] font-semibold text-on-secondary-container">
            Produk berhasil ditambahkan! Mengalihkan ke daftar produk...
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
                      <span className="material-symbols-outlined text-[18px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                        check_circle
                      </span>
                    </div>
                  )}
                  <div className="w-12 h-12 rounded-xl bg-secondary-container/50 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[24px] text-secondary">
                      eco
                    </span>
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
                      <span className="material-symbols-outlined text-[18px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                        check_circle
                      </span>
                    </div>
                  )}
                  <div className="w-12 h-12 rounded-xl bg-tertiary-container/50 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[24px] text-tertiary">
                      potted_plant
                    </span>
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

        {/* ─── Image Upload Card ─── */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-soft border border-outline-variant/20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-container/50 flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px] text-primary">image</span>
              </div>
              <div>
                <h3 className="text-[16px] font-bold text-on-surface">Foto Produk</h3>
                <p className="text-[12px] text-on-surface-variant">Maks. 5 foto, format JPG/PNG (maks. 2MB/foto)</p>
              </div>
            </div>
            <span className="text-[13px] font-semibold text-on-surface-variant">
              {images.length}/5
            </span>
          </div>

          {/* Drag & Drop Zone */}
          {images.length < 5 && (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
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
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                  isDragOver ? "bg-primary-container" : "bg-surface-container"
                }`}>
                  <span className={`material-symbols-outlined text-[28px] transition-colors ${
                    isDragOver ? "text-primary" : "text-on-surface-variant"
                  }`}>
                    cloud_upload
                  </span>
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-on-surface">
                    {isDragOver ? "Lepaskan file di sini" : "Tarik & lepas foto di sini"}
                  </p>
                  <p className="text-[13px] text-on-surface-variant mt-1">
                    atau <span className="text-primary font-semibold hover:underline">pilih dari perangkat</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Image Previews */}
          {images.length > 0 && (
            <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 ${images.length < 5 ? "mt-4" : ""}`}>
              {images.map((img, index) => (
                <div
                  key={img.id}
                  className="relative group aspect-square rounded-xl overflow-hidden border-2 border-outline-variant/20 hover:border-primary/40 transition-all"
                >
                  <img
                    src={img.preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {/* Overlay with index badge */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Photo number badge */}
                  {index === 0 && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-primary text-white text-[10px] font-bold rounded-md">
                      Utama
                    </div>
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
              ))}
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
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
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
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  Tambah Produk
                </>
              )}
            </button>
          </div>

          {/* Progress steps indicator */}
          {isSubmitting && (
            <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-outline-variant/20">
              <div className={`flex items-center gap-2 text-[12px] ${
                submitStep === "creating" ? "text-primary font-bold" : submitStep === "uploading" || submitStep === "done" ? "text-secondary" : "text-on-surface-variant"
              }`}>
                <span className="material-symbols-outlined text-[16px]" style={submitStep !== "creating" && submitStep !== "idle" ? { fontVariationSettings: "'FILL' 1" } : {}}>
                  {submitStep === "creating" ? "pending" : "check_circle"}
                </span>
                Buat Produk
              </div>
              <div className={`w-8 h-[2px] rounded-full ${
                submitStep === "uploading" || submitStep === "done" ? "bg-secondary" : "bg-outline-variant/30"
              }`} />
              <div className={`flex items-center gap-2 text-[12px] ${
                submitStep === "uploading" ? "text-primary font-bold" : submitStep === "done" ? "text-secondary" : "text-on-surface-variant"
              }`}>
                <span className="material-symbols-outlined text-[16px]" style={submitStep === "done" ? { fontVariationSettings: "'FILL' 1" } : {}}>
                  {submitStep === "uploading" ? "pending" : submitStep === "done" ? "check_circle" : "circle"}
                </span>
                Upload Foto
              </div>
              <div className={`w-8 h-[2px] rounded-full ${
                submitStep === "done" ? "bg-secondary" : "bg-outline-variant/30"
              }`} />
              <div className={`flex items-center gap-2 text-[12px] ${
                submitStep === "done" ? "text-secondary font-bold" : "text-on-surface-variant"
              }`}>
                <span className="material-symbols-outlined text-[16px]" style={submitStep === "done" ? { fontVariationSettings: "'FILL' 1" } : {}}>
                  {submitStep === "done" ? "check_circle" : "circle"}
                </span>
                Selesai
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
