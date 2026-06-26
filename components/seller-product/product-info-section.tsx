"use client";

import React from "react";
import PriceInput from "./price-input";

interface ProductInfoSectionProps {
  name: string;
  onNameChange: (v: string) => void;
  price: string;
  onPriceChange: (rawValue: string) => void;
  description: string;
  onDescriptionChange: (v: string) => void;
  isLifeFlower: boolean;
  onLifeFlowerChange: (v: boolean) => void;
}

/**
 * Product information card with name, price, description, and flower type toggle.
 */
export default function ProductInfoSection({
  name,
  onNameChange,
  price,
  onPriceChange,
  description,
  onDescriptionChange,
  isLifeFlower,
  onLifeFlowerChange,
}: ProductInfoSectionProps) {
  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-soft border border-outline-variant/20">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary-container/50 flex items-center justify-center">
          <span className="material-symbols-outlined text-[20px] text-primary">
            info
          </span>
        </div>
        <h3 className="text-[16px] font-bold text-on-surface">
          Informasi Produk
        </h3>
      </div>

      <div className="space-y-5">
        {/* Name */}
        <div className="space-y-2">
          <label
            htmlFor="product-name"
            className="text-[13px] font-semibold text-on-surface-variant"
          >
            Nama Produk <span className="text-error">*</span>
          </label>
          <input
            id="product-name"
            type="text"
            required
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Contoh: Buket Mawar Merah Premium"
            className="w-full px-5 py-4 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[14px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-outline-variant outline-none"
          />
        </div>

        {/* Price */}
        <div className="space-y-2">
          <label className="text-[13px] font-semibold text-on-surface-variant">
            Harga <span className="text-error">*</span>
          </label>
          <PriceInput
            value={price}
            onChange={onPriceChange}
            placeholder="0"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label
            htmlFor="product-description"
            className="text-[13px] font-semibold text-on-surface-variant"
          >
            Deskripsi Produk
          </label>
          <textarea
            id="product-description"
            rows={4}
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
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
              onClick={() => onLifeFlowerChange(true)}
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
                <span className="material-symbols-outlined text-[24px] text-secondary">
                  eco
                </span>
              </div>
              <div className="text-left">
                <p
                  className={`text-[14px] font-bold ${
                    isLifeFlower ? "text-primary" : "text-on-surface"
                  }`}
                >
                  Bunga Asli
                </p>
                <p className="text-[12px] text-on-surface-variant">
                  Fresh flowers
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onLifeFlowerChange(false)}
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
                <span className="material-symbols-outlined text-[24px] text-tertiary">
                  potted_plant
                </span>
              </div>
              <div className="text-left">
                <p
                  className={`text-[14px] font-bold ${
                    !isLifeFlower ? "text-primary" : "text-on-surface"
                  }`}
                >
                  Bunga Artifisial
                </p>
                <p className="text-[12px] text-on-surface-variant">
                  Artificial flowers
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
