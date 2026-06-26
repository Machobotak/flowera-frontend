"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import ToastContainer from "@/components/toast-container";
import { StarRating, LoadingState, ErrorState, NotFoundState } from "@/components/ui";
import { ProductDetailGallery } from "@/components/layout/product";
import { resolveImageUrl, getImageUrlFromArray } from "@/utils/image-url";

/* ──────────────────────────── Types ──────────────────────────── */

interface ProductImage {
  id: number;
  image_url: string;
  isDefault: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface ProductVariant {
  id: number;
  title: string;
  subTitle?: string;
  price: number;
  product_image?: Array<{
    id: number;
    image_url: string;
    isDefault?: number;
  }>;
  [key: string]: any;
}

interface AddonProduct {
  id: number;
  title?: string;
  name?: string;
  price: number;
  image_url?: string;
  product_image?: Array<{
    id: number;
    image_url: string;
  }>;
  [key: string]: any;
}

interface ProductData {
  id: number;
  name: string;
  slug: string;
  price: number;
  description: string | null;
  rating: number;
  isLifeFlower: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  product_image: ProductImage[];
  store?: {
    id: number;
    name: string;
    slug: string;
    logo: string | null;
    city: string;
  } | null;
}

/* ──────────────────────────── Helpers ──────────────────────────── */

/** Resolve image with ui-avatars fallback for null/empty paths */
function getImgUrl(path: string | null | undefined): string {
  if (!path) return "https://ui-avatars.com/api/?name=Product&background=8c4a5c&color=fff";
  return resolveImageUrl(path) || "https://ui-avatars.com/api/?name=Product&background=8c4a5c&color=fff";
}

function getAddonImgUrl(addon: AddonProduct): string | null {
  if (addon.image_url) return resolveImageUrl(addon.image_url) || null;
  return getImageUrlFromArray(addon.product_image || []) || null;
}

function getVariantImgUrl(variant: ProductVariant): string | null {
  return getImageUrlFromArray(variant.product_image || []) || null;
}

/* ──────────────────────────── Main Page ──────────────────────────── */

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<ProductData | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [addons, setAddons] = useState<AddonProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { toasts, addToast, removeToast } = useToast();

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<AddonProduct[]>([]);

  const fetchProduct = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await axios.get(`/api/user/product/detail/${productId}`, {
        withCredentials: true,
      });
      if (res.data?.status === "success" && res.data?.data) {
        const { product: productData, product_variant, addon_product } = res.data.data;
        setProduct(productData);
        setVariants(product_variant || []);
        setAddons(addon_product || []);
        if (product_variant && product_variant.length > 0) {
          setSelectedVariant(product_variant[0]);
        }
      } else {
        setProduct(null);
      }
    } catch {
      setError(true);
      addToast("Gagal memuat data produk.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) fetchProduct();
  }, [productId]);

  const toggleAddon = (addon: AddonProduct) => {
    setSelectedAddons((prev) =>
      prev.some((a) => a.id === addon.id)
        ? prev.filter((a) => a.id !== addon.id)
        : [...prev, addon]
    );
  };

  /* ── Render ── */

  if (loading) return <LoadingState message="Memuat produk..." />;
  if (error) return <ErrorState onRetry={fetchProduct} title="Gagal Memuat Produk" />;
  if (!product) return <NotFoundState title="Produk Tidak Ditemukan" message="Produk yang kamu cari tidak tersedia atau telah dihapus." />;

  const basePrice = product.price;
  const variantPrice = selectedVariant ? selectedVariant.price : basePrice;
  const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);
  const totalPrice = variantPrice + addonsTotal;

  return (
    <main className="max-w-container-max mx-auto px-margin-desktop space-y-stack-lg py-stack-md">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* ── Breadcrumb ── */}
      <nav className="flex items-center gap-2 text-[12px] leading-4 tracking-[0.03em] font-medium text-on-surface-variant">
        <Link className="hover:text-primary transition-colors" href="/">Home</Link>
        <span>/</span>
        {product.store && (
          <>
            <Link className="hover:text-primary transition-colors" href={`/store/${product.store.slug}`}>
              {product.store.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-on-surface font-semibold">{product.name}</span>
      </nav>

      {/* ── Product Detail ── */}
      <div className="animate-[fadeIn_0.3s_ease]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left: Gallery */}
          <div className="lg:col-span-5">
            <ProductDetailGallery
              images={product.product_image || []}
              productName={product.name}
              variants={variants}
              selectedVariantId={selectedVariant?.id ?? null}
              onSelectVariant={setSelectedVariant}
            />
          </div>

          {/* Center: Info */}
          <div className="lg:col-span-4 flex flex-col justify-start space-y-5">
            {/* Store link */}
            {product.store && (
              <Link href={`/store/${product.store.slug}`} className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-primary-container/50">
                  <img className="w-full h-full object-cover" src={getImgUrl(product.store.logo)} alt={product.store.name} />
                </div>
                <div>
                  <p className="text-[13px] text-on-surface-variant">Dari</p>
                  <p className="text-[14px] font-semibold text-primary group-hover:underline">{product.store.name}</p>
                </div>
              </Link>
            )}

            <h1 className="font-headline text-[28px] font-bold text-on-surface leading-tight">{product.name}</h1>

            <div className="flex items-center gap-2">
              <StarRating rating={product.rating} />
              <span className="text-[13px] text-on-surface-variant">({product.rating.toFixed(1)})</span>
            </div>

            <p className="text-[28px] font-bold text-primary">Rp {variantPrice.toLocaleString("id-ID")}</p>

            {product.description && (
              <p className="text-[14px] text-on-surface-variant leading-relaxed">{product.description}</p>
            )}

            {/* Life flower badge */}
            {product.isLifeFlower === 1 && (
              <div className="flex flex-wrap gap-3 text-[12px]">
                <span className="px-3 py-1 bg-tertiary-container/20 text-tertiary rounded-full text-[11px] font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">eco</span>
                  Bunga Hidup
                </span>
              </div>
            )}

            {/* Variants */}
            {variants.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-[14px] font-semibold text-on-surface">Varian</h3>
                <div className="flex flex-wrap gap-3">
                  {variants.map((v) => {
                    const isSelected = selectedVariant?.id === v.id;
                    const variantImg = getVariantImgUrl(v);
                    return (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariant(v)}
                        className={`flex items-center gap-3 p-2 border rounded-xl transition-all ${
                          isSelected
                            ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                            : "border-outline-variant/30 bg-white hover:border-primary hover:shadow-sm"
                        }`}
                      >
                        {variantImg ? (
                          <img src={variantImg} alt={v.title} className="w-12 h-12 rounded-lg object-cover shrink-0"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[20px] text-outline">inventory_2</span>
                          </div>
                        )}
                        <div className="text-left">
                          <p className="text-[13px] font-semibold text-on-surface leading-tight">{v.title}</p>
                          {v.subTitle && <p className="text-[11px] text-on-surface-variant">{v.subTitle}</p>}
                          <p className="text-[12px] font-bold text-primary mt-0.5">Rp {v.price.toLocaleString("id-ID")}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Addons */}
            {addons.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-[14px] font-semibold text-on-surface">Tambahan (Add-on)</h3>
                <div className="flex flex-wrap gap-3">
                  {addons.map((a) => {
                    const isSelected = selectedAddons.some((addon) => addon.id === a.id);
                    const addonImg = getAddonImgUrl(a);
                    return (
                      <button
                        key={a.id}
                        onClick={() => toggleAddon(a)}
                        className={`flex items-center gap-3 p-2 border rounded-xl transition-all ${
                          isSelected
                            ? "border-secondary bg-secondary/10 ring-2 ring-secondary/20"
                            : "border-outline-variant/30 bg-white hover:border-secondary hover:shadow-sm"
                        }`}
                      >
                        {addonImg ? (
                          <img src={addonImg} alt={a.title || a.name || "Addon"} className="w-12 h-12 rounded-lg object-cover shrink-0"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[20px] text-outline">add_circle</span>
                          </div>
                        )}
                        <div className="text-left">
                          <p className="text-[13px] font-semibold text-on-surface leading-tight">{a.title || a.name}</p>
                          <p className="text-[12px] font-bold text-secondary mt-0.5">+Rp {a.price.toLocaleString("id-ID")}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Location */}
            {product.store?.city && (
              <p className="flex items-center gap-1.5 text-[13px] text-on-surface-variant">
                <span className="material-symbols-outlined text-[16px] text-outline">location_on</span>
                {product.store.city}
              </p>
            )}
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-3">
            <div className="sticky top-24 bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
              <h3 className="font-body text-[14px] leading-5 tracking-[0.05em] font-semibold text-on-surface-variant mb-6 uppercase tracking-wider">
                Order Summary
              </h3>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between font-body text-[14px] leading-6">
                  <span className="text-on-surface-variant">
                    {selectedVariant ? selectedVariant.title : "Harga Dasar"}
                  </span>
                  <span className="font-medium">Rp {variantPrice.toLocaleString("id-ID")}</span>
                </div>

                {selectedAddons.map((a) => {
                  const addonImg = getAddonImgUrl(a);
                  return (
                    <div key={a.id} className="flex justify-between items-center font-body text-[14px] leading-6 text-on-surface-variant">
                      <span className="flex items-center gap-2">
                        {addonImg && (
                          <img src={addonImg} alt={a.title || a.name || "Addon"} className="w-8 h-8 rounded-md object-cover shrink-0"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        )}
                        {a.title || a.name}
                      </span>
                      <span>+Rp {a.price.toLocaleString("id-ID")}</span>
                    </div>
                  );
                })}

                {selectedAddons.length > 0 && <hr className="border-outline-variant/30" />}

                <div className="flex justify-between items-center pt-2">
                  <span className="font-bold text-on-surface">Total</span>
                  <span className="text-[24px] leading-8 font-bold text-primary">
                    Rp {totalPrice.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <button className="w-full bg-[#8c4a5c] text-white py-4 rounded-lg font-body text-[14px] tracking-[0.05em] font-semibold hover:bg-opacity-90 transition-colors active:scale-[0.98]">
                  Order Now
                </button>
                <button className="w-full border border-[#8c4a5c] text-[#8c4a5c] py-4 rounded-lg font-body text-[14px] tracking-[0.05em] font-semibold hover:bg-[#8c4a5c]/5 transition-colors active:scale-[0.98]">
                  Add to Cart
                </button>
                <button className="w-full text-[#8c4a5c] py-2 font-body text-[14px] tracking-[0.05em] font-semibold flex items-center justify-center gap-2 hover:bg-[#8c4a5c]/5 rounded-lg transition-colors">
                  <span className="material-symbols-outlined text-sm">favorite_border</span>
                  Save Design
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
