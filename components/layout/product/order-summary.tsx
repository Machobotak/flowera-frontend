"use client";

import React, { useState } from "react";
import type { AccessoryState, TouchState } from "@/types/product";
import { BASE_PRICE } from "@/data/product";
import { useAuth } from "@/contexts/auth-context";

/* ──────────────────────────── Props ──────────────────────────── */

interface OrderSummaryProps {
  flowerCost: number;
  accessories: Record<string, AccessoryState>;
  touches: Record<string, TouchState>;
  total: number;
}

/* ──────────────────────────── Component ──────────────────────────── */

export default function OrderSummary({
  flowerCost,
  accessories,
  touches,
  total,
}: OrderSummaryProps) {
  const { isLoggedIn } = useAuth();
  const [showToast, setShowToast] = useState(false);

  const handleOrderNow = () => {
    if (!isLoggedIn) {
      window.location.href = "/login?redirect=/cart";
      return;
    }
    window.location.href = "/cart";
  };

  const handleAddToCart = () => {
    if (!isLoggedIn) {
      window.location.href = "/login?redirect=/products";
      return;
    }
    // Show success toast
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="col-span-12 lg:col-span-3">
      <div className="sticky top-24 bg-white border border-outline-variant rounded-xl p-6 shadow-sm">
        <h3 className="font-body text-[14px] leading-5 tracking-[0.05em] font-semibold text-on-surface-variant mb-6 uppercase tracking-wider">
          Order Summary
        </h3>

        <div className="space-y-4 mb-8">
          {/* Base Price */}
          <div className="flex justify-between font-body text-[16px] leading-6">
            <span className="text-on-surface-variant">Base Price</span>
            <span className="font-medium">${BASE_PRICE.toFixed(2)}</span>
          </div>

          {/* Flower Upgrade */}
          {flowerCost > 0 && (
            <div className="flex justify-between font-body text-[16px] leading-6">
              <span className="text-on-surface-variant">Premium Flowers</span>
              <span className="font-medium">+${flowerCost.toFixed(2)}</span>
            </div>
          )}

          {/* Accessories */}
          {Object.values(accessories)
            .filter((a) => a.qty > 0)
            .map((a) => (
              <div
                key={a.name}
                className="flex justify-between font-body text-[16px] leading-6 text-on-surface-variant"
              >
                <span>
                  {a.name} (x{a.qty})
                </span>
                <span>${(a.qty * a.price).toFixed(2)}</span>
              </div>
            ))}

          {/* Touches */}
          {Object.values(touches)
            .filter((t) => t.active)
            .map((t) => (
              <div
                key={t.name}
                className="flex justify-between font-body text-[16px] leading-6 text-on-surface-variant"
              >
                <span>{t.name}</span>
                <span>${t.price.toFixed(2)}</span>
              </div>
            ))}

          <hr className="border-outline-variant" />

          {/* Total */}
          <div className="flex justify-between items-center pt-2">
            <span className="font-bold text-on-surface">Total</span>
            <span className="text-[28px] leading-9 font-bold text-primary">
              ${total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleOrderNow}
            className="w-full bg-primary text-white py-4 rounded-lg font-body text-[14px] tracking-[0.05em] font-semibold hover:bg-on-primary-container transition-colors active:scale-[0.98]"
          >
            Order Now
          </button>
          <button
            onClick={handleAddToCart}
            className="w-full border border-primary text-primary py-4 rounded-lg font-body text-[14px] tracking-[0.05em] font-semibold hover:bg-primary/5 transition-colors active:scale-[0.98]"
          >
            Add to Cart
          </button>
          <button className="w-full text-primary py-2 font-body text-[14px] tracking-[0.05em] font-semibold flex items-center justify-center gap-2 hover:bg-primary/5 rounded-lg transition-colors">
            <span className="material-symbols-outlined text-sm">
              favorite
            </span>
            Save Design
          </button>
        </div>

        <p className="mt-6 text-center text-[11px] text-on-surface-variant uppercase">
          Standard delivery: Tomorrow, 2pm
        </p>
      </div>

      {/* Toast notification */}
      {showToast && (
        <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-[100] animate-[fadeIn_0.3s_ease]">
          <div className="bg-secondary text-white px-6 py-3.5 rounded-xl shadow-float flex items-center gap-3">
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              check_circle
            </span>
            <span className="text-[14px] font-semibold">Berhasil ditambahkan ke keranjang!</span>
          </div>
        </div>
      )}
    </div>
  );
}
