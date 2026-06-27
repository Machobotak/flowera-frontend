"use client";

import React, { useState } from "react";

export default function PrivacyTab() {
  const [profileVisible, setProfileVisible] = useState(true);
  const [showActivity, setShowActivity] = useState(false);

  const ToggleSwitch = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <div
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${
        checked ? "bg-primary" : "bg-outline-variant/40"
      }`}
    >
      <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
        checked ? "translate-x-[22px]" : "translate-x-0.5"
      }`} />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-headline text-[24px] font-semibold text-on-surface">Pengaturan Privasi</h2>
        <p className="text-[13px] text-on-surface-variant mt-1">Kontrol siapa yang bisa melihat informasi kamu</p>
      </div>

      <div className="bg-white rounded-2xl border border-outline-variant/30 shadow-soft divide-y divide-outline-variant/20">
        <div className="flex items-center justify-between p-5">
          <div>
            <p className="text-[14px] font-semibold text-on-surface">Profil Publik</p>
            <p className="text-[12px] text-on-surface-variant mt-0.5">Izinkan orang lain melihat profil kamu</p>
          </div>
          <ToggleSwitch checked={profileVisible} onChange={setProfileVisible} />
        </div>
        <div className="flex items-center justify-between p-5">
          <div>
            <p className="text-[14px] font-semibold text-on-surface">Aktivitas Pembelian</p>
            <p className="text-[12px] text-on-surface-variant mt-0.5">Tampilkan riwayat pembelian di profil publik</p>
          </div>
          <ToggleSwitch checked={showActivity} onChange={setShowActivity} />
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-white rounded-2xl border border-error/20 shadow-soft p-6">
        <h3 className="text-[14px] font-semibold text-error mb-1 flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">warning</span>
          Zona Berbahaya
        </h3>
        <p className="text-[12px] text-on-surface-variant mb-4">Tindakan ini tidak bisa dibatalkan</p>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 border border-error/30 text-error rounded-xl text-[13px] font-semibold hover:bg-error-container/20 transition-all">
            Nonaktifkan Akun
          </button>
          <button className="px-5 py-2.5 bg-error text-white rounded-xl text-[13px] font-semibold hover:shadow-float active:scale-[0.98] transition-all">
            Hapus Akun
          </button>
        </div>
      </div>
    </div>
  );
}
