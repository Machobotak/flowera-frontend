"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { resolveImageUrl, getImageUrlFromArray } from "@/utils/image-url";

/* ──────────────────────────── Types ──────────────────────────── */

interface ProductImage {
  id: number;
  image_url: string;
  isDefault: number;
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

type GalleryItem = {
  key: string;
  imageUrl: string;
  label: string;
  isProduct: boolean;
  variantId?: number;
};

interface ProductDetailGalleryProps {
  images: ProductImage[];
  productName: string;
  variants: ProductVariant[];
  selectedVariantId?: number | null;
  onSelectVariant?: (variant: ProductVariant) => void;
}

/* ──────────────────────────── Component ──────────────────────────── */

/**
 * Product detail image gallery with zoom and thumbnails.
 * Combines product images + variant images into a unified gallery.
 */
export default function ProductDetailGallery({
  images,
  productName,
  variants,
  selectedVariantId,
  onSelectVariant,
}: ProductDetailGalleryProps) {
  // Build combined gallery: product images first, then variant images
  const items: GalleryItem[] = [];

  const sortedImages = [...images].sort((a, b) => {
    if (a.isDefault !== b.isDefault) return b.isDefault - a.isDefault;
    return a.id - b.id;
  });
  for (const img of sortedImages) {
    const url = resolveImageUrl(img.image_url);
    items.push({
      key: `prod-${img.id}`,
      imageUrl: url || `https://ui-avatars.com/api/?name=${encodeURIComponent(productName)}&background=8c4a5c&color=fff`,
      label: `${productName} - ${img.id}`,
      isProduct: true,
    });
  }

  // Variant images (appended after product images)
  for (const v of variants) {
    const imgUrl = getImageUrlFromArray(v.product_image || []);
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

  // Sync: variant selection from info panel → gallery jumps to variant image
  useEffect(() => {
    if (selectedVariantId != null) {
      const variantItem = items.find(
        (it) => !it.isProduct && it.variantId === selectedVariantId
      );
      if (variantItem) {
        setSelectedKey(variantItem.key);
      }
    }
  }, [selectedVariantId]);

  const selectedItem = items.find((it) => it.key === selectedKey) || items[0];

  // ─── Zoom logic ───
  const zoomContainerRef = useRef<HTMLDivElement>(null);
  const zoomImageRef = useRef<HTMLImageElement>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const ZOOM_SCALE = 2.5;

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const img = zoomImageRef.current;
      const container = zoomContainerRef.current;
      if (!img || !container) return;

      const rect = container.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      const my = (e.clientY - rect.top) / rect.height;

      const overflowX = rect.width * (ZOOM_SCALE - 1);
      const overflowY = rect.height * (ZOOM_SCALE - 1);

      const tx = -mx * overflowX;
      const ty = -my * overflowY;

      img.style.transform = `translate(${tx}px, ${ty}px) scale(${ZOOM_SCALE})`;
    },
    []
  );

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

  if (items.length === 0) return null;

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
        {/* Variant badge */}
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
              {!item.isProduct && (
                <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-tertiary" />
              )}
              {item.isProduct &&
                sortedImages.find(
                  (img) => `prod-${img.id}` === item.key
                )?.isDefault === 1 && (
                  <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-primary" />
                )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
