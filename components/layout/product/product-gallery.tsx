import React from "react";
import type { FlowerType, AccessoryState, TouchState } from "@/types/product";
import { THUMBNAIL_IMAGES, TEDDY_OVERLAY_SRC } from "@/data/product";

/* ──────────────────────────── Styles ──────────────────────────── */

const previewTransitionStyle: React.CSSProperties = {
  transition: "transform 0.5s ease-out, opacity 0.3s ease",
};

const accessoryLayerBase: React.CSSProperties = {
  transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
  pointerEvents: "none",
};

/* ──────────────────────────── Props ──────────────────────────── */

interface ProductGalleryProps {
  selectedFlower: FlowerType;
  currentImage: string;
  imageOpacity: number;
  accessories: Record<string, AccessoryState>;
  touches: Record<string, TouchState>;
  onFlowerChange: (type: FlowerType) => void;
}

/* ──────────────────────────── Component ──────────────────────────── */

export default function ProductGallery({
  selectedFlower,
  currentImage,
  imageOpacity,
  accessories,
  touches,
  onFlowerChange,
}: ProductGalleryProps) {
  return (
    <div className="col-span-12 lg:col-span-6 space-y-6">
      {/* Main Preview */}
      <div className="relative bg-white rounded-xl overflow-hidden aspect-square shadow-sm group border border-outline-variant">
        <img
          alt="Bespoke Artisan Bouquet"
          className="w-full h-full object-cover origin-center group-hover:scale-[1.5]"
          style={{ ...previewTransitionStyle, opacity: imageOpacity }}
          src={currentImage}
        />

        {/* Teddy Overlay */}
        <div
          className={`absolute bottom-10 right-10 w-24 h-24 ${
            accessories.teddy.qty > 0
              ? "opacity-100 scale-100"
              : "opacity-0 scale-50"
          }`}
          style={accessoryLayerBase}
        >
          <img
            alt="Teddy Bear Overlay"
            className="w-full h-full object-contain drop-shadow-lg"
            src={TEDDY_OVERLAY_SRC}
          />
        </div>

        {/* Balloon Overlay */}
        <div
          className={`absolute top-10 right-10 w-32 h-32 ${
            accessories.balloon.qty > 0
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-10"
          }`}
          style={accessoryLayerBase}
        >
          <div className="w-full h-full bg-primary/20 rounded-full flex items-center justify-center border-2 border-primary/40 backdrop-blur-sm">
            <span className="material-symbols-outlined text-primary text-4xl">
              circle
            </span>
          </div>
        </div>

        {/* LED Lights Overlay */}
        <div
          className={`absolute inset-0 pointer-events-none mix-blend-screen ${
            touches.lights.active ? "opacity-100" : "opacity-0"
          }`}
          style={{
            ...accessoryLayerBase,
            background:
              "radial-gradient(circle at center, rgba(254,249,195,0.3) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Thumbnails */}
      <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
        {THUMBNAIL_IMAGES.map((thumb) => (
          <button
            key={thumb.type}
            className={`flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition-colors ${
              selectedFlower === thumb.type
                ? "border-primary"
                : "border-transparent hover:border-primary/50"
            }`}
            onClick={() => onFlowerChange(thumb.type)}
          >
            <img
              alt={thumb.alt}
              className="w-full h-full object-cover"
              src={thumb.src}
            />
          </button>
        ))}
        <div className="flex-shrink-0 w-24 h-24 rounded-lg bg-surface-container flex items-center justify-center border border-dashed border-outline text-on-surface-variant">
          <span className="material-symbols-outlined">videocam</span>
        </div>
      </div>
    </div>
  );
}
