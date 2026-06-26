"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import ToastContainer from "@/components/toast-container";

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

const getImageUrl = (path: string | null): string => {
  if (!path)
    return "https://ui-avatars.com/api/?name=Product&background=8c4a5c&color=fff";
  if (path.startsWith("http")) return path;
  const baseUrl = process.env.NEXT_PUBLIC_ACCESS_FILE_STORAGE || "http://192.168.3.23";
  return path.startsWith("/") ? `${baseUrl}${path}` : `${baseUrl}/${path}`;
};

const getVariantImageUrl = (variant: ProductVariant): string | null => {
  // Cek product_image array (struktur dari backend: product_image[0].image_url)
  const images = variant.product_image;
  if (images && images.length > 0) {
    const img = images[0];
    const path = img.image_url;
    if (path) return getImageUrl(path);
  }
  return null;
};

const getAddonImageUrl = (addon: AddonProduct): string | null => {
  // Cek image_url langsung
  if (addon.image_url) return getImageUrl(addon.image_url);
  // Cek product_image array (struktur dari backend)
  const images = addon.product_image;
  if (images && images.length > 0) {
    const path = images[0].image_url;
    if (path) return getImageUrl(path);
  }
  return null;
};

const FILL_STYLE = { fontVariationSettings: "'FILL' 1" } as const;

/* ──────────────────────────── Sub‑components ──────────────────────────── */

function StarRating({ rating }: { rating: number }) {
  const max = 5;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          className={`material-symbols-outlined text-[20px] ${
            i < Math.round(rating) ? "text-[#FFB129]" : "text-outline/30"
          }`}
          style={FILL_STYLE}
        >
          star
        </span>
      ))}
    </div>
  );
}

/* ──────────────────────────── States ──────────────────────────── */

function LoadingState() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-on-surface-variant text-[14px] font-medium">
          Memuat produk...
        </p>
      </div>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center text-center py-16 px-4">
        <div className="w-20 h-20 rounded-full bg-error-container/20 flex items-center justify-center mb-5">
          <span className="material-symbols-outlined text-error text-4xl">
            error
          </span>
        </div>
        <h2 className="font-headline text-[24px] font-semibold text-on-surface mb-2">
          Gagal Memuat Produk
        </h2>
        <p className="text-on-surface-variant text-[14px] max-w-sm mb-8">
          Terjadi kesalahan saat memuat data produk. Silakan coba lagi.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onRetry}
            className="px-8 py-4 bg-primary text-white rounded-xl font-body text-[14px] font-semibold shadow-soft hover:shadow-float transition-all"
          >
            Coba Lagi
          </button>
          <Link
            href="/"
            className="px-8 py-4 border border-outline-variant/30 text-on-surface-variant rounded-xl font-body text-[14px] font-semibold hover:bg-surface-container transition-all"
          >
            Kembali
          </Link>
        </div>
      </div>
    </div>
  );
}

function NotFoundState() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center text-center py-16 px-4">
        <div className="w-20 h-20 rounded-full bg-outline/10 flex items-center justify-center mb-5">
          <span className="material-symbols-outlined text-outline text-4xl">
            search_off
          </span>
        </div>
        <h2 className="font-headline text-[24px] font-semibold text-on-surface mb-2">
          Produk Tidak Ditemukan
        </h2>
        <p className="text-on-surface-variant text-[14px] max-w-sm mb-8">
          Produk yang kamu cari tidak tersedia atau telah dihapus.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-xl font-body text-[14px] font-semibold shadow-soft hover:shadow-float transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">
            arrow_back
          </span>
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}

/* ──────────────────────────── Image Gallery ──────────────────────────── */

type GalleryItem = {
  key: string;         // unique key: "prod-{id}" | "var-{variantId}"
  imageUrl: string;    // full resolved URL
  label: string;       // alt text
  isProduct: boolean;  // true = product image, false = variant image
  variantId?: number;  // only for variant items
};

function ImageGallery({
  images,
  productName,
  variants,
  selectedVariantId,
  onSelectVariant,
}: {
  images: ProductImage[];
  productName: string;
  variants: ProductVariant[];
  selectedVariantId?: number | null;
  onSelectVariant?: (variant: ProductVariant) => void;
}) {
  // Build combined gallery: product images first, then variant images
  const items: GalleryItem[] = [];

  // Product images (sorted: default first)
  const sortedImages = [...images].sort((a, b) => {
    if (a.isDefault !== b.isDefault) return b.isDefault - a.isDefault;
    return a.id - b.id;
  });
  for (const img of sortedImages) {
    items.push({
      key: `prod-${img.id}`,
      imageUrl: getImageUrl(img.image_url),
      label: `${productName} - ${img.id}`,
      isProduct: true,
    });
  }

  // Variant images (appended after product images)
  for (const v of variants) {
    const imgUrl = getVariantImageUrl(v);
    if (imgUrl) {
      items.push({
        key: `var-${v.id}`,
        imageUrl: imgUrl,
        label: v.title,
        isProduct: false,
        variantId: v.id,
      });
    }
  }

  const [selectedKey, setSelectedKey] = useState<string>(
    items.length > 0 ? items[0].key : ""
  );

  // Sync: klik varian dari info panel → gallery ikut pindah
  useEffect(() => {
    if (selectedVariantId != null) {
      const variantItem = items.find(
        (it) => !it.isProduct && it.variantId === selectedVariantId
      );
      if (variantItem) {
        setSelectedKey(variantItem.key);
      }
    }
    // kalau selectedVariantId null/undefined, biarkan gallery di posisi saat ini
  }, [selectedVariantId]);

  const selectedItem = items.find((it) => it.key === selectedKey) || items[0];

  // ─── Zoom logic ───
  const zoomContainerRef = useRef<HTMLDivElement>(null);
  const zoomImageRef = useRef<HTMLImageElement>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const ZOOM_SCALE = 2.5;

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const img = zoomImageRef.current;
    const container = zoomContainerRef.current;
    if (!img || !container) return;

    const rect = container.getBoundingClientRect();
    const mx = (e.clientX - rect.left) / rect.width;  // 0–1
    const my = (e.clientY - rect.top) / rect.height;  // 0–1

    // Overflow = seberapa banyak gambar zoom melebihi container
    const overflowX = rect.width * (ZOOM_SCALE - 1);
    const overflowY = rect.height * (ZOOM_SCALE - 1);

    // Mouse [0,1] → translate [-overflow, 0]
    const tx = -mx * overflowX;
    const ty = -my * overflowY;

    img.style.transform = `translate(${tx}px, ${ty}px) scale(${ZOOM_SCALE})`;
  }, []);

  const handleMouseEnter = useCallback(() => {
    const img = zoomImageRef.current;
    if (img) {
      img.style.transformOrigin = "0 0";
      img.style.transform = `scale(${ZOOM_SCALE})`;
    }
    setIsZoomed(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    const img = zoomImageRef.current;
    if (img) {
      img.style.transform = "scale(1)";
    }
    setIsZoomed(false);
  }, []);

  return (
    <div className="space-y-3">
      {/* Main Image with Zoom */}
      <div
        ref={zoomContainerRef}
        className="aspect-square rounded-2xl overflow-hidden shadow-soft border border-outline-variant/10 bg-surface-container-low relative cursor-crosshair group"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
      >
        {selectedItem && (
          <img
            ref={zoomImageRef}
            className="w-full h-full object-cover transition-transform duration-200"
            style={{ transformOrigin: "0 0" }}
            src={selectedItem.imageUrl}
            alt={selectedItem.label}
            draggable={false}
          />
        )}
        {/* Badge varian */}
        {selectedItem && !selectedItem.isProduct && (
          <div className="absolute top-3 left-3 px-3 py-1.5 bg-primary text-white text-[11px] font-semibold rounded-lg shadow-sm z-10">
            {selectedItem.label}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {items.length > 0 && (
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {items.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                setSelectedKey(item.key);
                // Auto-select variant kalau klik varian image
                if (!item.isProduct && item.variantId && onSelectVariant) {
                  const v = variants.find((v) => v.id === item.variantId);
                  if (v) onSelectVariant(v);
                }
              }}
              className={`relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                selectedKey === item.key
                  ? "border-primary shadow-soft ring-2 ring-primary/30"
                  : "border-outline-variant/20 hover:border-outline-variant/50"
              }`}
            >
              <img
                className="w-full h-full object-cover"
                src={item.imageUrl}
                alt={item.label}
              />
              {/* Dot: product default → primary, variant → tertiary */}
              {!item.isProduct && (
                <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-tertiary" />
              )}
              {item.isProduct && sortedImages.find((img) => `prod-${img.id}` === item.key)?.isDefault === 1 && (
                <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-primary" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
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

  // Selection state
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<AddonProduct[]>([]);

  const fetchProduct = async () => {
    setLoading(true);
    setError(false);
    try {
      // TODO: Isi URL endpoint backend Anda di sini
      const API_URL = `/api/user/product/detail/${productId}`;
      const res = await axios.get(`${API_URL}`, {
        withCredentials: true,
      });

      if (res.data?.status === "success" && res.data?.data) {
        const { product: productData, product_variant, addon_product } = res.data.data;
        setProduct(productData);
        setVariants(product_variant || []);
        setAddons(addon_product || []);
        
        // Auto-select first variant if exists
        if (product_variant && product_variant.length > 0) {
          setSelectedVariant(product_variant[0]);
        }
      } else {
        setProduct(null);
      }
    } catch (err) {
      setError(true);
      addToast("Gagal memuat data produk.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const toggleAddon = (addon: AddonProduct) => {
    if (selectedAddons.find((a) => a.id === addon.id)) {
      setSelectedAddons(selectedAddons.filter((a) => a.id !== addon.id));
    } else {
      setSelectedAddons([...selectedAddons, addon]);
    }
  };

  /* ── Render ── */

  if (loading) return <LoadingState />;
  if (error) return <ErrorState onRetry={fetchProduct} />;
  if (!product) return <NotFoundState />;

  // Pricing calculations
  const basePrice = product.price;
  const variantPrice = selectedVariant ? selectedVariant.price : basePrice;
  const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);
  const totalPrice = variantPrice + addonsTotal;

  return (
    <main className="max-w-container-max mx-auto px-margin-desktop space-y-stack-lg py-stack-md">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      {/* ── Breadcrumb ── */}
      <nav className="flex items-center gap-2 text-[12px] leading-4 tracking-[0.03em] font-medium text-on-surface-variant">
        <Link className="hover:text-primary transition-colors" href="/">
          Home
        </Link>
        <span>/</span>
        {product.store && (
          <>
            <Link
              className="hover:text-primary transition-colors"
              href={`/store/${product.store.slug}`}
            >
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
          {/* Left: Product Images */}
          <div className="lg:col-span-5">
            <ImageGallery
              images={product.product_image || []}
              productName={product.name}
              variants={variants}
              selectedVariantId={selectedVariant?.id ?? null}
              onSelectVariant={setSelectedVariant}
            />
          </div>

          {/* Center: Product Info */}
          <div className="lg:col-span-4 flex flex-col justify-start space-y-5">
            {/* Store link */}
            {product.store && (
              <Link
                href={`/store/${product.store.slug}`}
                className="flex items-center gap-3 group"
              >
                <div className="w-10 h-10 rounded-full overflow-hidden border border-primary-container/50">
                  <img
                    className="w-full h-full object-cover"
                    src={getImageUrl(product.store.logo)}
                    alt={product.store.name}
                  />
                </div>
                <div>
                  <p className="text-[13px] text-on-surface-variant">Dari</p>
                  <p className="text-[14px] font-semibold text-primary group-hover:underline">
                    {product.store.name}
                  </p>
                </div>
              </Link>
            )}

            {/* Name */}
            <h1 className="font-headline text-[28px] font-bold text-on-surface leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <StarRating rating={product.rating} />
              <span className="text-[13px] text-on-surface-variant">
                ({product.rating.toFixed(1)})
              </span>
            </div>

            {/* Price */}
            <p className="text-[28px] font-bold text-primary">
              Rp {variantPrice.toLocaleString("id-ID")}
            </p>

            {/* Description */}
            {product.description && (
              <p className="text-[14px] text-on-surface-variant leading-relaxed">
                {product.description}
              </p>
            )}

            {/* Meta */}
            <div className="flex flex-wrap gap-3 text-[12px]">
              {/* Life flower badge */}
              {product.isLifeFlower === 1 && (
                <span className="px-3 py-1 bg-tertiary-container/20 text-tertiary rounded-full text-[11px] font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">
                    eco
                  </span>
                  Bunga Hidup
                </span>
              )}
            </div>

            {/* Variants */}
            {variants.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-[14px] font-semibold text-on-surface">Varian</h3>
                <div className="flex flex-wrap gap-3">
                  {variants.map((v) => {
                    const isSelected = selectedVariant?.id === v.id;
                    const variantImg = getVariantImageUrl(v);
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
                          <img
                            src={variantImg}
                            alt={v.title}
                            className="w-12 h-12 rounded-lg object-cover shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[20px] text-outline">inventory_2</span>
                          </div>
                        )}
                        <div className="text-left">
                          <p className="text-[13px] font-semibold text-on-surface leading-tight">
                            {v.title}
                          </p>
                          {v.subTitle && (
                            <p className="text-[11px] text-on-surface-variant">{v.subTitle}</p>
                          )}
                          <p className="text-[12px] font-bold text-primary mt-0.5">
                            Rp {v.price.toLocaleString("id-ID")}
                          </p>
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
                    const addonImg = getAddonImageUrl(a);
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
                          <img
                            src={addonImg}
                            alt={a.title || a.name || "Addon"}
                            className="w-12 h-12 rounded-lg object-cover shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[20px] text-outline">add_circle</span>
                          </div>
                        )}
                        <div className="text-left">
                          <p className="text-[13px] font-semibold text-on-surface leading-tight">
                            {a.title || a.name}
                          </p>
                          <p className="text-[12px] font-bold text-secondary mt-0.5">
                            +Rp {a.price.toLocaleString("id-ID")}
                          </p>
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
                <span className="material-symbols-outlined text-[16px] text-outline">
                  location_on
                </span>
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
                {/* Base Price / Variant Price */}
                <div className="flex justify-between font-body text-[14px] leading-6">
                  <span className="text-on-surface-variant">
                    {selectedVariant ? selectedVariant.title : "Harga Dasar"}
                  </span>
                  <span className="font-medium">Rp {variantPrice.toLocaleString("id-ID")}</span>
                </div>

                {/* Selected Addons */}
                {selectedAddons.map((a) => {
                  const addonImg = getAddonImageUrl(a);
                  return (
                    <div
                      key={a.id}
                      className="flex justify-between items-center font-body text-[14px] leading-6 text-on-surface-variant"
                    >
                      <span className="flex items-center gap-2">
                        {addonImg && (
                          <img
                            src={addonImg}
                            alt={a.title || a.name || "Addon"}
                            className="w-8 h-8 rounded-md object-cover shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        )}
                        {a.title || a.name}
                      </span>
                      <span>+Rp {a.price.toLocaleString("id-ID")}</span>
                    </div>
                  );
                })}

                {selectedAddons.length > 0 && <hr className="border-outline-variant/30" />}

                {/* Total */}
                <div className="flex justify-between items-center pt-2">
                  <span className="font-bold text-on-surface">Total</span>
                  <span className="text-[24px] leading-8 font-bold text-primary">
                    Rp {totalPrice.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button className="w-full bg-[#8c4a5c] text-white py-4 rounded-lg font-body text-[14px] tracking-[0.05em] font-semibold hover:bg-opacity-90 transition-colors active:scale-[0.98]">
                  Order Now
                </button>
                <button className="w-full border border-[#8c4a5c] text-[#8c4a5c] py-4 rounded-lg font-body text-[14px] tracking-[0.05em] font-semibold hover:bg-[#8c4a5c]/5 transition-colors active:scale-[0.98]">
                  Add to Cart
                </button>
                <button className="w-full text-[#8c4a5c] py-2 font-body text-[14px] tracking-[0.05em] font-semibold flex items-center justify-center gap-2 hover:bg-[#8c4a5c]/5 rounded-lg transition-colors">
                  <span className="material-symbols-outlined text-sm">
                    favorite_border
                  </span>
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
