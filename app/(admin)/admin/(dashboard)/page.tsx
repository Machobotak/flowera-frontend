"use client";

import React from "react";

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-soft border border-outline-variant/20">
        <h2 className="font-headline text-[24px] font-semibold text-on-surface mb-2">
          Selamat Datang di Admin Center!
        </h2>
        <p className="text-[14px] text-on-surface-variant">
          Kelola kategori, sub kategori, dan produk dari halaman ini.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-soft border border-outline-variant/20">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary-container text-primary flex items-center justify-center">
              <span
                className="material-symbols-outlined text-[24px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                category
              </span>
            </div>
            <div>
              <h3 className="text-[14px] font-semibold text-on-surface-variant">
                Kategori Produk
              </h3>
              <p className="text-[24px] font-bold text-on-surface">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-soft border border-outline-variant/20">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-tertiary-container text-tertiary flex items-center justify-center">
              <span
                className="material-symbols-outlined text-[24px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                inventory_2
              </span>
            </div>
            <div>
              <h3 className="text-[14px] font-semibold text-on-surface-variant">
                Total Produk
              </h3>
              <p className="text-[24px] font-bold text-on-surface">0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
