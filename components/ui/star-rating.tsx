"use client";

import React from "react";

interface StarRatingProps {
  rating: number;
  size?: number; // text-[Npx] value, default 20
}

const FILL_STYLE = { fontVariationSettings: "'FILL' 1" } as const;

/**
 * Reusable star rating display with 5 stars.
 */
export default function StarRating({ rating, size = 20 }: StarRatingProps) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={`material-symbols-outlined ${
            i < Math.round(rating) ? "text-[#FFB129]" : "text-outline/30"
          }`}
          style={{ ...FILL_STYLE, fontSize: `${size}px` }}
        >
          star
        </span>
      ))}
    </div>
  );
}
