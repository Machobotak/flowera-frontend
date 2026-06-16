"use client";

import React from "react";

interface ProductCardProps {
  name: string;
  florist: string;
  price: string;
  rating: string;
  location: string;
  sold: string;
  image: string;
  imageAlt: string;
}

const FILL_STYLE = { fontVariationSettings: "'FILL' 1" } as const;

export default function ProductCard({
  name,
  florist,
  price,
  rating,
  location,
  sold,
  image,
  imageAlt,
}: ProductCardProps) {
  return (
    <a href="/products" className="block bg-white rounded-xl shadow-soft overflow-hidden group hover:shadow-float transition-all cursor-pointer">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden">
        <img
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          alt={imageAlt}
          src={image}
        />
        <button
          onClick={(e) => e.preventDefault()}
          className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-md rounded-full text-error opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <span className="material-symbols-outlined">favorite</span>
        </button>
      </div>

      {/* Details */}
      <div className="p-4 space-y-2">
        <h4 className="font-headline-md text-[18px] text-on-surface truncate">
          {name}
        </h4>

        <div className="flex items-center gap-2">
          <span
            className="material-symbols-outlined text-secondary text-[16px]"
            style={FILL_STYLE}
          >
            verified
          </span>
          <p className="font-label-sm text-on-surface-variant text-[12px]">
            {florist}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2">
          <p className="font-bold text-primary text-[18px]">{price}</p>
          <div className="flex items-center gap-1">
            <span
              className="material-symbols-outlined text-[#FFB129] text-[16px]"
              style={FILL_STYLE}
            >
              star
            </span>
            <span className="font-label-md text-[12px]">{rating}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-outline pt-2 border-t border-outline-variant/10">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">
              location_on
            </span>
            {location}
          </span>
          <span>{sold}</span>
        </div>
      </div>
    </a>
  );
}
