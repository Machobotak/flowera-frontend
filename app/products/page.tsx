"use client";

import React from "react";
import { useProductCustomizer } from "@/hooks/use-product-customizer";
import ProductGallery from "@/components/layout/product/product-gallery";
import ProductInfo from "@/components/layout/product/product-info";
import CustomizationPanel from "@/components/layout/product/customization-panel";
import OrderSummary from "@/components/layout/product/order-summary";

/* ──────────────────────────── Page Component ──────────────────────────── */

export default function ProductPage() {
  const {
    selectedFlower,
    selectedColor,
    setSelectedColor,
    imageOpacity,
    accessories,
    touches,
    currentImage,
    flowerCost,
    total,
    handleFlowerChange,
    handleQtyChange,
    handleToggleTouch,
  } = useProductCustomizer();

  return (
    <main className="pt-8 pb-16 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
      <div className="grid grid-cols-12 gap-8">
        {/* ── Left Column: Gallery and Live Preview ── */}
        <ProductGallery
          selectedFlower={selectedFlower}
          currentImage={currentImage}
          imageOpacity={imageOpacity}
          accessories={accessories}
          touches={touches}
          onFlowerChange={handleFlowerChange}
        />

        {/* ── Center Column: Details and Customization ── */}
        <div className="col-span-12 lg:col-span-3 space-y-8">
          <ProductInfo total={total} />
          <CustomizationPanel
            selectedFlower={selectedFlower}
            selectedColor={selectedColor}
            accessories={accessories}
            touches={touches}
            onFlowerChange={handleFlowerChange}
            onColorChange={setSelectedColor}
            onQtyChange={handleQtyChange}
            onToggleTouch={handleToggleTouch}
          />
        </div>

        {/* ── Right Column: Sticky Purchase Panel ── */}
        <OrderSummary
          flowerCost={flowerCost}
          accessories={accessories}
          touches={touches}
          total={total}
        />
      </div>
    </main>
  );
}