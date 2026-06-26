"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import type { VariantFormEntry, AddonFormEntry } from "@/types/product";
import type { ImagePreview } from "./use-product-images";

export type SubmitStep =
  | "idle"
  | "saving"
  | "uploading"
  | "setting_cover"
  | "creating_variants"
  | "creating_addons"
  | "done";

interface UseProductFormOptions {
  productId: string;
  isEditMode: boolean;
  addToast: (msg: string, type: "error" | "success") => void;
}

/**
 * Product-level form state + submit orchestration.
 * Handles: name, price, description, isLifeFlower, and the full submit flow.
 */
export function useProductForm({
  productId,
  isEditMode,
  addToast,
}: UseProductFormOptions) {
  const router = useRouter();

  // ─── Product state ───
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [isLifeFlower, setIsLifeFlower] = useState(true);

  // ─── Page state ───
  const [isLoadingProduct, setIsLoadingProduct] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStep, setSubmitStep] = useState<SubmitStep>("idle");

  // ─── Price helpers ───
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setPrice(e.target.value.replace(/\D/g, ""));


  // ─── Submit ───
  const handleSubmit = async ({
    images,
    variants,
    addons,
  }: {
    images: ImagePreview[];
    variants: VariantFormEntry[];
    addons: AddonFormEntry[];
  }) => {
    if (!name.trim()) {
      addToast("Nama produk harus diisi", "error");
      return;
    }
    if (!price || parseInt(price) <= 0) {
      addToast("Harga produk harus lebih dari 0", "error");
      return;
    }

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

        // Upload any NEW images
        const newImages = images.filter((img) => !img.isExisting && img.file);
        if (newImages.length > 0) {
          setSubmitStep("uploading");
          const formData = new FormData();
          newImages.forEach((img) => formData.append("files", img.file!));
          await axios.post(
            `/api/seller/product/${productId}/images`,
            formData,
            { withCredentials: true }
          );
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

        activeProductId =
          createRes.data?.data?.id || createRes.data?.id;
        if (!activeProductId)
          throw new Error("Gagal mendapatkan ID produk dari server");

        const newFiles = images.filter((img) => img.file);
        if (newFiles.length > 0) {
          setSubmitStep("uploading");
          const formData = new FormData();
          newFiles.forEach((img) => formData.append("files", img.file!));
          const uploadRes = await axios.post(
            `/api/seller/product/${activeProductId}/images`,
            formData,
            { withCredentials: true }
          );

          // Auto-set first uploaded image as default cover
          setSubmitStep("setting_cover");
          const uploadedImages =
            uploadRes.data?.data || uploadRes.data?.images || [];
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
                console.warn("Gagal mengatur foto cover default");
              }
            }
          }
        }
      }

      // ── Create new variants ──
      const variantsToCreate = variants.filter((v) => !v.backendId);
      if (variantsToCreate.length > 0) {
        setSubmitStep("creating_variants");
        for (const variant of variantsToCreate) {
          const formData = new FormData();
          formData.append("title", variant.title);
          formData.append("sub_title", variant.sub_title);
          formData.append("price", variant.price);
          formData.append("product_id", String(activeProductId));
          if (variant.imageFile) {
            formData.append("file", variant.imageFile);
          }
          await axios.post("/api/seller/product-variant/create", formData, {
            withCredentials: true,
          });
        }
      }

      // ── Create new addons ──
      const addonsToCreate = addons.filter((a) => !a.backendId);
      if (addonsToCreate.length > 0) {
        setSubmitStep("creating_addons");
        for (const addon of addonsToCreate) {
          const formData = new FormData();
          formData.append("title", addon.title);
          formData.append("price", addon.price);
          formData.append("product_id", String(activeProductId));
          if (addon.imageFile) {
            formData.append("file", addon.imageFile);
          }
          await axios.post("/api/seller/addon-product/create", formData, {
            withCredentials: true,
          });
        }
      }

      setSubmitStep("done");
      setTimeout(() => router.push("/store/products"), 1000);
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Gagal menyimpan produk. Silakan coba lagi.";
      addToast(message, "error");
      setSubmitStep("idle");
      setIsSubmitting(false);
    }
  };

  // ─── Step text ───
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
      case "creating_addons":
        return "Menyimpan addon...";
      case "done":
        return "Berhasil! Mengalihkan...";
      default:
        return isEditMode ? "Simpan Perubahan" : "Tambah Produk";
    }
  };

  return {
    // Product state
    name,
    setName,
    price,
    setPrice,
    description,
    setDescription,
    isLifeFlower,
    setIsLifeFlower,

    // Page state
    isLoadingProduct,
    setIsLoadingProduct,
    isSubmitting,
    submitStep,

    // Handlers
    handlePriceChange,
    handleSubmit,
    getStepText,
  };
}
