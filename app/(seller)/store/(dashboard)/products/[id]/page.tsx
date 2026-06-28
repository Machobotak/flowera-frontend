"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import type { VariantFormEntry, AddonFormEntry } from "@/types/product";
import { useToast } from "@/hooks/use-toast";
import { useProductForm } from "@/hooks/use-product-form";
import { useProductImages } from "@/hooks/use-product-images";
import ToastContainer from "@/components/toast-container";
import {
  ProductInfoSection,
  VariantSection,
  AddonSection,
  ImageUploadZone,
  ImagePreviewGrid,
  SubmitSection,
} from "@/components/seller-product";

export default function ProductFormPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const isEditMode = productId !== "new";

  // ─── Toast ───
  const { toasts, addToast, removeToast } = useToast();

  // ─── Hooks ───
  const {
    name, setName,
    price, setPrice,
    weight, setWeight,
    description, setDescription,
    isLifeFlower, setIsLifeFlower,
    subCategoryId, setSubCategoryId,
    isLoadingProduct, setIsLoadingProduct,
    isSubmitting,
    submitStep,
    handleSubmit,
    getStepText,
  } = useProductForm({ productId, isEditMode, addToast });

  const {
    images, isDragOver, setIsDragOver,
    defaultImageId, settingCoverId,
    addFiles, removeImage, handleDrop,
    setDefaultCover, loadExistingImages,
  } = useProductImages();

  // ─── Refs for submit access (section components own their state) ───
  const variantsRef = useRef<VariantFormEntry[]>([]);
  const addonsRef = useRef<AddonFormEntry[]>([]);
  // Initial items for edit-mode pre-population
  const [initialVariants, setInitialVariants] = useState<VariantFormEntry[]>([]);
  const [initialAddons, setInitialAddons] = useState<AddonFormEntry[]>([]);

  // Sub-categories (menunggu endpoint seller-side dari backend)
  const [subCategories, setSubCategories] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    const fetchSubCategories = async () => {
      try {
        const res = await axios.get("/api/seller/sub-product-categories", { withCredentials: true });
        const data = res.data?.data ?? res.data ?? [];
        if (Array.isArray(data)) {
          setSubCategories(data.map((c: any) => ({ id: c.id, name: c.name || c.title || "" })));
        }
      } catch {
        // Endpoint belum tersedia — dropdown akan kosong sampai backend menyediakan
      }
    };
    fetchSubCategories();
  }, []);

  // ─── Load existing data on edit mode ───
  useEffect(() => {
    if (!isEditMode) return;

    const fetchEditData = async () => {
      try {
        const res = await axios.get("/api/seller/product", { withCredentials: true });
        const all: any[] = res.data?.data || res.data || [];
        const found = all.find((p: any) => String(p.id) === productId);
        if (!found) throw new Error("Produk tidak ditemukan");

        // Load basic info
        setName(found.name || "");
        setPrice(String(found.price || ""));
        setWeight(String(found.weight || ""));
        setDescription(found.description || "");
        setIsLifeFlower(found.isLifeFlower ?? true);
        setSubCategoryId(String(found.sub_product_categories_id || found.subProductCategoriesId || ""));

        // Load images
        const existingImages = found.product_image || found.images || [];
        const storageBase =
          process.env.NEXT_PUBLIC_ACCESS_FILE_STORAGE ||
          process.env.NEXT_PUBLIC_API_URL ||
          "http://localhost:3000";
        loadExistingImages(existingImages, storageBase);

        // Load variants
        try {
          const variantRes = await axios.get("/api/seller/product-variant", {
            data: { product: parseInt(productId) },
            withCredentials: true,
          });
          const variantData: any[] = variantRes.data?.data ?? variantRes.data ?? [];
          if (Array.isArray(variantData) && variantData.length > 0) {
            const mapped: VariantFormEntry[] = variantData.map((v: any) => {
              let imagePreview: string | undefined;
              const imgs = v.product_image;
              if (imgs && imgs.length > 0) {
                const raw = imgs[0].image_url;
                if (raw) {
                  imagePreview = raw.startsWith("http")
                    ? raw
                    : `${storageBase}${raw.startsWith("/") ? raw : `/${raw}`}`;
                }
              }
              return {
                localId: `existing-var-${v.id}`,
                title: v.title || v.name || "",
                sub_title: v.sub_title || "",
                price: String(v.price || ""),
                backendId: v.id,
                imagePreview,
              };
            });
            setInitialVariants(mapped);
          }
        } catch { /* non-fatal */ }

        // Load addons
        try {
          const addonRes = await axios.get("/api/seller/addon-product", {
            data: { product: parseInt(productId) },
            withCredentials: true,
          });
          const addonData: any[] = addonRes.data?.data ?? addonRes.data ?? [];
          if (Array.isArray(addonData) && addonData.length > 0) {
            const mapped: AddonFormEntry[] = addonData.map((a: any) => {
              let imagePreview: string | undefined;
              const imgs = a.product_image;
              if (imgs && imgs.length > 0) {
                const raw = imgs[0].image_url;
                if (raw) {
                  imagePreview = raw.startsWith("http")
                    ? raw
                    : `${storageBase}${raw.startsWith("/") ? raw : `/${raw}`}`;
                }
              }
              return {
                localId: `existing-addon-${a.id}`,
                title: a.title || a.name || "",
                price: String(a.price || ""),
                backendId: a.id,
                imagePreview,
              };
            });
            setInitialAddons(mapped);
          }
        } catch { /* non-fatal */ }
      } catch (err: any) {
        addToast(err.message || "Gagal memuat data produk", "error");
      } finally {
        setIsLoadingProduct(false);
      }
    };

    fetchEditData();
  }, [isEditMode, productId]);

  // ─── Submit wrapper ───
  const onSubmit = () => {
    handleSubmit({
      images,
      variants: variantsRef.current,
      addons: addonsRef.current,
    });
  };

  // ─── Loading skeleton ───
  if (isLoadingProduct) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
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
    <div className="space-y-6 max-w-3xl mx-auto">
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

      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Form sections */}
      <ProductInfoSection
        name={name}
        onNameChange={setName}
        price={price}
        onPriceChange={(v) => setPrice(v)}
        weight={weight}
        onWeightChange={(v) => setWeight(v)}
        description={description}
        onDescriptionChange={setDescription}
        isLifeFlower={isLifeFlower}
        onLifeFlowerChange={setIsLifeFlower}
        subCategoryId={subCategoryId}
        onSubCategoryChange={setSubCategoryId}
        subCategories={subCategories}
      />

      <VariantSection
        initialItems={initialVariants}
        itemsRef={variantsRef}
        productId={isEditMode ? productId : null}
        addToast={addToast}
      />

      <AddonSection
        initialItems={initialAddons}
        itemsRef={addonsRef}
        productId={isEditMode ? productId : null}
        addToast={addToast}
      />

      {/* Image Upload Card */}
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-soft border border-outline-variant/20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-container/50 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px] text-primary">
                image
              </span>
            </div>
            <div>
              <h3 className="text-[16px] font-bold text-on-surface">
                Foto Produk
              </h3>
              <p className="text-[12px] text-on-surface-variant">
                {isEditMode
                  ? "Foto lama tetap tersimpan. Tambah foto baru jika diperlukan."
                  : "Maks. 5 foto, format JPG/PNG/WebP"}
              </p>
            </div>
          </div>
          <span className="text-[13px] font-semibold text-on-surface-variant">
            {images.length}/5
          </span>
        </div>

        <ImageUploadZone
          onFilesSelected={addFiles}
          isDragOver={isDragOver}
          setIsDragOver={setIsDragOver}
          currentCount={images.length}
        />

        <ImagePreviewGrid
          images={images}
          defaultImageId={defaultImageId}
          settingCoverId={settingCoverId}
          isEditMode={isEditMode}
          onSetCover={(img) => {
            if (isEditMode) setDefaultCover(img, parseInt(productId));
          }}
          onRemove={removeImage}
        />
      </div>

      {/* Submit Section */}
      <SubmitSection
        isEditMode={isEditMode}
        isSubmitting={isSubmitting}
        submitStep={submitStep}
        onSubmit={onSubmit}
        onCancel={() => router.back()}
        getStepText={getStepText}
      />
    </div>
  );
}
