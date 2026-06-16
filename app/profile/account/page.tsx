"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

/* ──────────────────────────── Types ──────────────────────────── */

type AccountTab = "profile" | "bank" | "address" | "password" | "notification" | "privacy";

interface Address {
  id: string;
  label: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  isDefault: boolean;
}

/* ──────────────────────────── Constants ──────────────────────────── */

const FILL_STYLE = { fontVariationSettings: "'FILL' 1" } as const;

const USER = {
  name: "Eleanor Vance",
  label: "Premium Member",
  avatar:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBnNFXBawqirwRLnyecSeAd6E2mzFVJEOOXq-W98lx1c_Z7ieclUEvOAvqYH_svhA6fvyPWicVWnYrlsGo6YZRU8J5pR2ZGzyRhLZvJ7rjqHm1xgxZk85d1AOVTLZAnAlOp0m6hD1NalFRswYil1qcxkUpbXKkaq1NYvrE2JNlKiQd1fZVh5s8isV340Js_BP-7444W03IttiJTczSGODFZigsJOesIRPRWBrjbwNwLI36apTgWfECrhT1CJWU55BNsVgYdJuCfn1Q",
};

const ACCOUNT_TABS: { id: AccountTab; icon: string; label: string }[] = [
  { id: "profile", icon: "person", label: "Profil" },
  { id: "bank", icon: "credit_card", label: "Bank & Kartu" },
  { id: "address", icon: "location_on", label: "Alamat" },
  { id: "password", icon: "lock", label: "Ubah Password" },
  { id: "notification", icon: "notifications", label: "Pengaturan Notifikasi" },
  { id: "privacy", icon: "shield", label: "Pengaturan Privasi" },
];

const SIDEBAR_LINKS = [
  { icon: "person", label: "Akun Saya", href: "/profile/account", active: true, filled: true },
  { icon: "shopping_bag", label: "Pesanan Saya", href: "/profile" },
  { icon: "notifications", label: "Notifikasi", href: "#" },
  { icon: "favorite", label: "Wishlist", href: "#" },
];

const SIDEBAR_LINKS_BOTTOM = [
  { icon: "confirmation_number", label: "Voucher", href: "#" },
  { icon: "settings", label: "Pengaturan", href: "#" },
];

const INITIAL_ADDRESSES: Address[] = [
  {
    id: "1",
    label: "Rumah",
    name: "Eleanor Vance",
    phone: "081234567890",
    address: "Jl. Sudirman No. 123, Gedung A Lt. 5",
    city: "Jakarta Selatan",
    postalCode: "12190",
    isDefault: true,
  },
  {
    id: "2",
    label: "Kantor",
    name: "Eleanor Vance",
    phone: "081234567890",
    address: "Jl. Gatot Subroto Kav. 42, Tower B Lt. 18",
    city: "Jakarta Selatan",
    postalCode: "12950",
    isDefault: false,
  },
];

/* ──────────────────────────── Sub-components ──────────────────────────── */

function AccountSidebar({ activeTab, onTabChange }: { activeTab: AccountTab; onTabChange: (tab: AccountTab) => void }) {
  const [akunOpen, setAkunOpen] = useState(true);

  return (
    <aside className="w-full md:w-80 flex-shrink-0">
      <div className="bg-white rounded-2xl p-8 shadow-soft flex flex-col items-center sticky top-24">
        {/* Avatar */}
        <div className="relative mb-5 group">
          <img
            alt="Avatar"
            className="w-24 h-24 rounded-full object-cover border-4 border-surface-container shadow-md"
            src={USER.avatar}
          />
          <button className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full shadow-lg hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-[14px]">edit</span>
          </button>
        </div>
        <h2 className="font-headline text-[22px] font-semibold text-on-surface mb-0.5">{USER.name}</h2>
        <p className="text-[14px] text-on-surface-variant mb-1">{USER.label}</p>
        <a href="/profile/account" className="text-[12px] text-primary font-semibold hover:underline mb-6 flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">edit</span>
          Ubah Profil
        </a>

        {/* Nav links */}
        <nav className="w-full space-y-1">
          {/* Akun Saya — toggle sub-menu */}
          <button
            onClick={() => setAkunOpen(!akunOpen)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-semibold tracking-[0.05em] bg-primary-container/20 text-primary transition-colors w-full text-left"
          >
            <span className="material-symbols-outlined text-[20px]" style={FILL_STYLE}>person</span>
            <span className="flex-1">Akun Saya</span>
            <span className={`material-symbols-outlined text-[18px] text-primary/60 transition-transform ${akunOpen ? "rotate-180" : ""}`}>
              expand_more
            </span>
          </button>

          {/* Sub-menu — expanded by default on account page */}
          {akunOpen && (
            <div className="space-y-0.5 pl-8 animate-[fadeIn_0.2s_ease]">
              {ACCOUNT_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center gap-3 px-4 py-2 rounded-xl text-[12px] font-medium tracking-[0.03em] transition-colors w-full text-left ${
                    activeTab === tab.id
                      ? "bg-primary-container/15 text-primary font-semibold"
                      : "text-on-surface-variant hover:bg-surface-container"
                  }`}
                >
                  <span className="material-symbols-outlined text-[17px]" style={activeTab === tab.id ? FILL_STYLE : undefined}>
                    {tab.icon}
                  </span>
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {/* Pesanan Saya */}
          <a
            href="/profile"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-semibold tracking-[0.05em] text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
            Pesanan Saya
          </a>

          {/* Other links */}
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-semibold tracking-[0.05em] text-on-surface-variant hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            Notifikasi
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-semibold tracking-[0.05em] text-on-surface-variant hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-[20px]">favorite</span>
            Wishlist
          </a>

          <div className="h-px bg-outline-variant/30 my-4" />

          {SIDEBAR_LINKS_BOTTOM.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-semibold tracking-[0.05em] text-on-surface-variant hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">{link.icon}</span>
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </aside>
  );
}

/* ──────────── Profile Tab ──────────── */

function ProfileTab() {
  const [name, setName] = useState("Eleanor Vance");
  const [email, setEmail] = useState("eleanor.vance@email.com");
  const [phone, setPhone] = useState("081234567890");
  const [gender, setGender] = useState("female");
  const [birthday, setBirthday] = useState("1995-03-15");
  const [bio, setBio] = useState("Flower enthusiast & botanical lover 🌸");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-headline text-[24px] font-semibold text-on-surface">Profil Saya</h2>
          <p className="text-[13px] text-on-surface-variant mt-1">Kelola informasi profil untuk mengontrol akun kamu</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-outline-variant/30 shadow-soft overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          {/* Form */}
          <div className="flex-1 p-7 space-y-5">
            {/* Name */}
            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
              <label className="text-[13px] text-on-surface-variant text-right">Nama</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[13px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            {/* Email */}
            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
              <label className="text-[13px] text-on-surface-variant text-right">Email</label>
              <div className="flex items-center gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[13px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
                <span className="material-symbols-outlined text-secondary text-[18px]" style={FILL_STYLE}>verified</span>
              </div>
            </div>

            {/* Phone */}
            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
              <label className="text-[13px] text-on-surface-variant text-right">No. Telepon</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[13px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            {/* Gender */}
            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
              <label className="text-[13px] text-on-surface-variant text-right">Jenis Kelamin</label>
              <div className="flex gap-5">
                {[
                  { value: "male", label: "Laki-laki" },
                  { value: "female", label: "Perempuan" },
                  { value: "other", label: "Lainnya" },
                ].map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                    <div className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center transition-all ${
                      gender === opt.value ? "border-primary" : "border-outline-variant"
                    }`}>
                      {gender === opt.value && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                    </div>
                    <span className="text-[13px] text-on-surface">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Birthday */}
            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
              <label className="text-[13px] text-on-surface-variant text-right">Tanggal Lahir</label>
              <input
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                className="px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[13px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            {/* Bio */}
            <div className="grid grid-cols-[120px_1fr] items-start gap-4">
              <label className="text-[13px] text-on-surface-variant text-right pt-3">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[13px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
              />
            </div>

            {/* Save */}
            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
              <div />
              <div className="flex items-center gap-4">
                <button
                  onClick={handleSave}
                  className="bg-primary text-white px-8 py-3 rounded-xl text-[13px] font-semibold shadow-soft hover:shadow-float hover:scale-[1.01] active:scale-[0.98] transition-all"
                >
                  Simpan
                </button>
                {saved && (
                  <span className="text-[13px] text-secondary font-medium flex items-center gap-1 animate-[fadeIn_0.3s_ease]">
                    <span className="material-symbols-outlined text-[16px]" style={FILL_STYLE}>check_circle</span>
                    Berhasil disimpan!
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Avatar upload */}
          <div className="lg:w-64 p-7 lg:border-l border-t lg:border-t-0 border-outline-variant/20 flex flex-col items-center justify-start gap-4">
            <div className="relative">
              <img
                alt="Avatar"
                className="w-28 h-28 rounded-full object-cover border-4 border-surface-container shadow-md"
                src={USER.avatar}
              />
              <div className="absolute inset-0 rounded-full bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                <span className="material-symbols-outlined text-white text-[24px]">photo_camera</span>
              </div>
            </div>
            <button className="text-[12px] text-primary font-semibold hover:underline">
              Pilih Gambar
            </button>
            <p className="text-[10px] text-on-surface-variant text-center leading-3.5">
              Ukuran file maks. 1 MB<br />
              Format: .JPEG, .PNG
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────── Address Tab ──────────── */

function AddressTab() {
  const [addresses, setAddresses] = useState<Address[]>(INITIAL_ADDRESSES);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form fields
  const [formLabel, setFormLabel] = useState("");
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formCity, setFormCity] = useState("Jakarta Selatan");
  const [formPostalCode, setFormPostalCode] = useState("");

  const resetForm = () => {
    setFormLabel("");
    setFormName("");
    setFormPhone("");
    setFormAddress("");
    setFormCity("Jakarta Selatan");
    setFormPostalCode("");
    setEditingId(null);
  };

  const openAddForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (addr: Address) => {
    setFormLabel(addr.label);
    setFormName(addr.name);
    setFormPhone(addr.phone);
    setFormAddress(addr.address);
    setFormCity(addr.city);
    setFormPostalCode(addr.postalCode);
    setEditingId(addr.id);
    setShowForm(true);
  };

  const handleSaveAddress = () => {
    if (!formName || !formPhone || !formAddress || !formPostalCode) return;

    if (editingId) {
      setAddresses((prev) =>
        prev.map((a) =>
          a.id === editingId
            ? { ...a, label: formLabel || "Alamat", name: formName, phone: formPhone, address: formAddress, city: formCity, postalCode: formPostalCode }
            : a
        )
      );
    } else {
      const newAddr: Address = {
        id: Date.now().toString(),
        label: formLabel || "Alamat Baru",
        name: formName,
        phone: formPhone,
        address: formAddress,
        city: formCity,
        postalCode: formPostalCode,
        isDefault: addresses.length === 0,
      };
      setAddresses((prev) => [...prev, newAddr]);
    }
    setShowForm(false);
    resetForm();
  };

  const handleSetDefault = (id: string) => {
    setAddresses((prev) =>
      prev.map((a) => ({ ...a, isDefault: a.id === id }))
    );
  };

  const handleDelete = (id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-headline text-[24px] font-semibold text-on-surface">Alamat Saya</h2>
          <p className="text-[13px] text-on-surface-variant mt-1">Kelola alamat pengiriman kamu</p>
        </div>
        <button
          onClick={openAddForm}
          className="bg-primary text-white px-5 py-2.5 rounded-xl text-[13px] font-semibold shadow-soft hover:shadow-float active:scale-[0.98] transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Tambah Alamat
        </button>
      </div>

      {/* Address form modal */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-outline-variant/30 shadow-soft p-7 animate-[fadeIn_0.3s_ease]">
          <h3 className="text-[16px] font-semibold text-on-surface mb-5">
            {editingId ? "Edit Alamat" : "Tambah Alamat Baru"}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-on-surface-variant">Label Alamat</label>
              <input
                type="text"
                value={formLabel}
                onChange={(e) => setFormLabel(e.target.value)}
                placeholder="contoh: Rumah, Kantor"
                className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[13px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-on-surface-variant">Nama Penerima</label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Nama lengkap"
                className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[13px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-on-surface-variant">No. Telepon</label>
              <input
                type="tel"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="08xxxxxxxxxx"
                className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[13px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-on-surface-variant">Kota</label>
              <select
                value={formCity}
                onChange={(e) => setFormCity(e.target.value)}
                className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[13px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
              >
                <option>Jakarta Selatan</option>
                <option>Jakarta Pusat</option>
                <option>Jakarta Barat</option>
                <option>Jakarta Timur</option>
                <option>Jakarta Utara</option>
                <option>Tangerang</option>
                <option>Bandung</option>
                <option>Surabaya</option>
              </select>
            </div>
          </div>
          <div className="space-y-4 mb-5">
            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-on-surface-variant">Alamat Lengkap</label>
              <textarea
                value={formAddress}
                onChange={(e) => setFormAddress(e.target.value)}
                placeholder="Nama jalan, nomor rumah, RT/RW"
                rows={3}
                className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[13px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                required
              />
            </div>
            <div className="w-full sm:w-1/2 space-y-1.5">
              <label className="text-[12px] font-semibold text-on-surface-variant">Kode Pos</label>
              <input
                type="text"
                value={formPostalCode}
                onChange={(e) => setFormPostalCode(e.target.value)}
                placeholder="12345"
                maxLength={5}
                className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[13px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                required
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSaveAddress}
              className="bg-primary text-white px-6 py-3 rounded-xl text-[13px] font-semibold shadow-soft hover:shadow-float active:scale-[0.98] transition-all"
            >
              {editingId ? "Simpan Perubahan" : "Tambah Alamat"}
            </button>
            <button
              onClick={() => { setShowForm(false); resetForm(); }}
              className="px-6 py-3 border border-outline-variant/40 rounded-xl text-[13px] font-semibold text-on-surface-variant hover:bg-surface-container transition-all"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Address list */}
      <div className="space-y-4">
        {addresses.map((addr) => (
          <div
            key={addr.id}
            className={`bg-white rounded-2xl border-2 p-6 shadow-soft transition-all ${
              addr.isDefault ? "border-primary/30" : "border-outline-variant/20"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[14px] font-semibold text-on-surface">{addr.name}</span>
                  <span className="text-[11px] text-on-surface-variant">|</span>
                  <span className="text-[13px] text-on-surface-variant">{addr.phone}</span>
                </div>
                <p className="text-[13px] text-on-surface-variant leading-5 mb-2">{addr.address}</p>
                <p className="text-[13px] text-on-surface-variant">{addr.city}, {addr.postalCode}</p>
                <div className="flex items-center gap-3 mt-3">
                  {addr.isDefault && (
                    <span className="text-[11px] font-bold text-primary border border-primary px-2.5 py-0.5 rounded">
                      Utama
                    </span>
                  )}
                  <span className="bg-surface-container text-on-surface-variant px-2.5 py-0.5 rounded text-[11px] font-medium">
                    {addr.label}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditForm(addr)}
                    className="text-[12px] text-primary font-semibold hover:underline"
                  >
                    Ubah
                  </button>
                  {!addr.isDefault && (
                    <>
                      <span className="text-outline-variant">|</span>
                      <button
                        onClick={() => handleDelete(addr.id)}
                        className="text-[12px] text-error font-semibold hover:underline"
                      >
                        Hapus
                      </button>
                    </>
                  )}
                </div>
                {!addr.isDefault && (
                  <button
                    onClick={() => handleSetDefault(addr.id)}
                    className="text-[12px] text-on-surface-variant border border-outline-variant/40 px-3 py-1.5 rounded-lg hover:bg-surface-container transition-all"
                  >
                    Atur sebagai Utama
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {addresses.length === 0 && (
          <div className="bg-white rounded-2xl border border-outline-variant/30 p-12 text-center">
            <span className="material-symbols-outlined text-[48px] text-outline-variant mb-4 block">location_off</span>
            <p className="text-[14px] text-on-surface-variant mb-4">Belum ada alamat tersimpan</p>
            <button
              onClick={openAddForm}
              className="text-[13px] text-primary font-semibold hover:underline"
            >
              + Tambah Alamat Pertama
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ──────────── Password Tab ──────────── */

function PasswordTab() {
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

/* ──────────── Bank Tab ──────────── */

function BankTab() {
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

/* ──────────── Notification Tab ──────────── */

function NotificationTab() {
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [promos, setPromos] = useState(true);
  const [chat, setChat] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [emailNotif, setEmailNotif] = useState(true);

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
        <h2 className="font-headline text-[24px] font-semibold text-on-surface">Pengaturan Notifikasi</h2>
        <p className="text-[13px] text-on-surface-variant mt-1">Atur jenis notifikasi yang ingin kamu terima</p>
      </div>

      <div className="bg-white rounded-2xl border border-outline-variant/30 shadow-soft divide-y divide-outline-variant/20">
        {[
          { label: "Update Pesanan", desc: "Pemberitahuan status pesanan, pengiriman, dan selesai", checked: orderUpdates, onChange: setOrderUpdates },
          { label: "Promo & Diskon", desc: "Penawaran khusus, voucher, dan campaign menarik", checked: promos, onChange: setPromos },
          { label: "Chat & Pesan", desc: "Pesan dari florist atau customer service", checked: chat, onChange: setChat },
          { label: "Notifikasi SMS", desc: "Terima notifikasi melalui SMS", checked: smsNotif, onChange: setSmsNotif },
          { label: "Notifikasi Email", desc: "Terima notifikasi melalui email", checked: emailNotif, onChange: setEmailNotif },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between p-5">
            <div>
              <p className="text-[14px] font-semibold text-on-surface">{item.label}</p>
              <p className="text-[12px] text-on-surface-variant mt-0.5">{item.desc}</p>
            </div>
            <ToggleSwitch checked={item.checked} onChange={item.onChange} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ──────────── Privacy Tab ──────────── */

function PrivacyTab() {
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

/* ──────────────────────────── Page ──────────────────────────── */

export default function AccountPage() {
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab") as AccountTab | null;
  const validTabs: AccountTab[] = ["profile", "bank", "address", "password", "notification", "privacy"];
  const initialTab = tabFromUrl && validTabs.includes(tabFromUrl) ? tabFromUrl : "profile";
  const [activeTab, setActiveTab] = useState<AccountTab>(initialTab);

  const renderTab = () => {
    switch (activeTab) {
      case "profile": return <ProfileTab />;
      case "bank": return <BankTab />;
      case "address": return <AddressTab />;
      case "password": return <PasswordTab />;
      case "notification": return <NotificationTab />;
      case "privacy": return <PrivacyTab />;
    }
  };

  return (
    <main className="pt-8 pb-16 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row gap-8">
        <AccountSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <section className="flex-grow min-w-0">
          {renderTab()}
        </section>
      </div>
    </main>
  );
}
