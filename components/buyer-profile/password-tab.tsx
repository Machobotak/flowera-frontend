"use client";

import React, { useState } from "react";

export default function PasswordTab() {
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-headline text-[24px] font-semibold text-on-surface">Ubah Password</h2>
        <p className="text-[13px] text-on-surface-variant mt-1">Untuk keamanan akun, mohon jangan bagikan password kamu ke orang lain</p>
      </div>

      <div className="bg-white rounded-2xl border border-outline-variant/30 shadow-soft p-7 max-w-lg space-y-5">
        <div className="space-y-1.5">
          <label className="text-[12px] font-semibold text-on-surface-variant">Password Saat Ini</label>
          <div className="relative">
            <input
              type={showCurrent ? "text" : "password"}
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              placeholder="Masukkan password saat ini"
              className="w-full px-4 py-3 pr-12 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[13px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">{showCurrent ? "visibility_off" : "visibility"}</span>
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[12px] font-semibold text-on-surface-variant">Password Baru</label>
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              placeholder="Minimal 8 karakter"
              className="w-full px-4 py-3 pr-12 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[13px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">{showNew ? "visibility_off" : "visibility"}</span>
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[12px] font-semibold text-on-surface-variant">Konfirmasi Password Baru</label>
          <input
            type="password"
            value={confirmPw}
            onChange={(e) => setConfirmPw(e.target.value)}
            placeholder="Ulangi password baru"
            className={`w-full px-4 py-3 bg-surface-container-low border rounded-xl text-[13px] focus:ring-2 focus:ring-primary/20 transition-all ${
              confirmPw && confirmPw !== newPw ? "border-error" : "border-outline-variant/30 focus:border-primary"
            }`}
          />
          {confirmPw && confirmPw !== newPw && (
            <p className="text-[11px] text-error font-medium">Password tidak cocok</p>
          )}
        </div>

        <button className="bg-primary text-white px-8 py-3 rounded-xl text-[13px] font-semibold shadow-soft hover:shadow-float active:scale-[0.98] transition-all mt-2">
          Konfirmasi
        </button>
      </div>
    </div>
  );
}
