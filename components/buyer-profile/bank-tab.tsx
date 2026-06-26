"use client";

import React from "react";

export default function BankTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-headline text-[24px] font-semibold text-on-surface">Bank & Kartu</h2>
        <p className="text-[13px] text-on-surface-variant mt-1">Kelola kartu dan rekening bank untuk pembayaran</p>
      </div>

      <div className="bg-white rounded-2xl border border-outline-variant/30 shadow-soft p-12 text-center">
        <span className="material-symbols-outlined text-[48px] text-outline-variant mb-4 block">credit_card_off</span>
        <p className="text-[14px] text-on-surface-variant mb-4">Belum ada metode pembayaran tersimpan</p>
        <button className="bg-primary text-white px-5 py-2.5 rounded-xl text-[13px] font-semibold shadow-soft hover:shadow-float active:scale-[0.98] transition-all flex items-center gap-2 mx-auto">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Tambah Kartu/Rekening
        </button>
      </div>
    </div>
  );
}
