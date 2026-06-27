"use client";

import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import ToastContainer from "@/components/toast-container";
import { getProfileDetail, updateProfile } from "@/utils/profile-api";
import { useAuth } from "@/contexts/auth-context";

const FILL_STYLE = { fontVariationSettings: "'FILL' 1" } as const;

const FALLBACK_AVATAR =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBnNFXBawqirwRLnyecSeAd6E2mzFVJEOOXq-W98lx1c_Z7ieclUEvOAvqYH_svhA6fvyPWicVWnYrlsGo6YZRU8J5pR2ZGzyRhLZvJ7rjqHm1xgxZk85d1AOVTLZAnAlOp0m6hD1NalFRswYil1qcxkUpbXKkaq1NYvrE2JNlKiQd1fZVh5s8isV340Js_BP-7444W03IttiJTczSGODFZigsJOesIRPRWBrjbwNwLI36apTgWfECrhT1CJWU55BNsVgYdJuCfn1Q";

export default function ProfileTab() {
  const { user } = useAuth();
  const { toasts, addToast, removeToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [phone, setPhone] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [birthday, setBirthday] = useState("");
  const [gender, setGender] = useState("");
  const [avatar, setAvatar] = useState(user?.avatar || "");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getProfileDetail();
        // Handle both wrapped ({ data: {...} }) and unwrapped responses
        const data = (res as any)?.data || res || {};
        // name & email come from auth context — profile API only provides the extras
        setPhone(data.no_hp || data.phone_number || data.phone || "");
        setBirthPlace(data.birth_place || "");
        const rawBirth = data.birth_date || data.birt_date || data.birthday || data.birthDate || data.tanggal_lahir || "";
        if (rawBirth) {
          const d = new Date(rawBirth);
          if (!isNaN(d.getTime())) {
            setBirthday(d.toISOString().split("T")[0]);
          } else {
            const cleaned = rawBirth.replace(/[^\d]/g, "").slice(0, 8);
            if (cleaned.length === 8) {
              setBirthday(`${cleaned.slice(0, 4)}-${cleaned.slice(4, 6)}-${cleaned.slice(6, 8)}`);
            } else {
              setBirthday(rawBirth.slice(0, 10));
            }
          }
        }
        setGender(data.gender || "");
        setAvatar(data.avatar || data.image_url || "");
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        no_hp: phone || undefined,
        birth_place: birthPlace || undefined,
        birth_date: birthday
          ? (() => { const d = new Date(birthday); return isNaN(d.getTime()) ? birthday : d.toISOString().split("T")[0]; })()
          : undefined,
        gender: gender || undefined,
      });
      addToast("Profil berhasil disimpan!", "success");
    } catch (err: any) {
      addToast(err.response?.data?.message || err.message || "Gagal menyimpan profil", "error");
    } finally { setSaving(false); }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div><h2 className="font-headline text-[24px] font-semibold text-on-surface">Profil Saya</h2><p className="text-[13px] text-on-surface-variant mt-1">Memuat data profil...</p></div>
        <div className="bg-white rounded-2xl border border-outline-variant/30 shadow-soft p-7 space-y-5 animate-pulse">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="grid grid-cols-[120px_1fr] items-center gap-4">
              <div className="h-4 w-20 bg-surface-container rounded" />
              <div className="h-10 bg-surface-container rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className="flex items-center justify-between">
        <div><h2 className="font-headline text-[24px] font-semibold text-on-surface">Profil Saya</h2><p className="text-[13px] text-on-surface-variant mt-1">Kelola informasi profil untuk mengontrol akun kamu</p></div>
      </div>
      <div className="bg-white rounded-2xl border border-outline-variant/30 shadow-soft overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          <div className="flex-1 p-7 space-y-5">
            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
              <label className="text-[13px] text-on-surface-variant text-right">Nama</label>
              <input type="text" value={user?.name || ""} readOnly className="px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[13px] text-on-surface/60" />
            </div>
            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
              <label className="text-[13px] text-on-surface-variant text-right">Email</label>
              <div className="flex items-center gap-3">
                <input type="email" value={user?.email || ""} readOnly className="flex-1 px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[13px] text-on-surface/60" />
                {user?.email && <span className="material-symbols-outlined text-secondary text-[18px]" style={FILL_STYLE}>verified</span>}
              </div>
            </div>
            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
              <label className="text-[13px] text-on-surface-variant text-right">No. Telepon</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[13px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
            </div>
            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
              <label className="text-[13px] text-on-surface-variant text-right">Jenis Kelamin</label>
              <div className="flex gap-5">
                {[{ value: "laki-laki", label: "Laki-laki" }, { value: "perempuan", label: "Perempuan" }].map((opt) => (
                  <label key={opt.value} onClick={() => setGender(opt.value)} className="flex items-center gap-2 cursor-pointer select-none">
                    <div className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center transition-all ${gender === opt.value ? "border-primary" : "border-outline-variant"}`}>
                      {gender === opt.value && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                    </div>
                    <span className="text-[13px] text-on-surface">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
              <label className="text-[13px] text-on-surface-variant text-right">Tempat Lahir</label>
              <input type="text" value={birthPlace} onChange={(e) => setBirthPlace(e.target.value)} placeholder="Contoh: Jakarta" className="px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[13px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
            </div>
            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
              <label className="text-[13px] text-on-surface-variant text-right">Tanggal Lahir</label>
              <input type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} className="px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[13px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
            </div>
            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
              <div />
              <div className="flex items-center gap-4">
                <button onClick={handleSave} disabled={saving} className="bg-primary text-white px-8 py-3 rounded-xl text-[13px] font-semibold shadow-soft hover:shadow-float hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-2">
                  {saving ? (<><span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span> Menyimpan...</>) : "Simpan"}
                </button>
              </div>
            </div>
          </div>
          <div className="lg:w-64 p-7 lg:border-l border-t lg:border-t-0 border-outline-variant/20 flex flex-col items-center justify-start gap-4">
            <div className="relative">
              <img alt="Avatar" className="w-28 h-28 rounded-full object-cover border-4 border-surface-container shadow-md" src={avatar || user?.avatar || FALLBACK_AVATAR} />
              <div className="absolute inset-0 rounded-full bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                <span className="material-symbols-outlined text-white text-[24px]">photo_camera</span>
              </div>
            </div>
            <button className="text-[12px] text-primary font-semibold hover:underline">Pilih Gambar</button>
            <p className="text-[10px] text-on-surface-variant text-center leading-3.5">Ukuran file maks. 1 MB<br />Format: .JPEG, .PNG</p>
          </div>
        </div>
      </div>
    </div>
  );
}
