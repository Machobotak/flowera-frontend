"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/auth-context";

type AccountTab = "profile" | "bank" | "address" | "password" | "notification" | "privacy";

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

export type { AccountTab };

interface AccountSidebarProps {
  activeTab: AccountTab;
  onTabChange: (tab: AccountTab) => void;
}

export default function AccountSidebar({ activeTab, onTabChange }: AccountSidebarProps) {
  const [akunOpen, setAkunOpen] = useState(true);
  const { user } = useAuth();

  return (
    <aside className="w-full md:w-80 flex-shrink-0">
      <div className="bg-white rounded-2xl p-8 shadow-soft flex flex-col items-center sticky top-24">
        {/* Avatar */}
        <div className="relative mb-5 group">
          <img
            alt="Avatar"
            className="w-24 h-24 rounded-full object-cover border-4 border-surface-container shadow-md"
            src={user?.avatar || USER.avatar}
          />
          <button className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full shadow-lg hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-[14px]">edit</span>
          </button>
        </div>
        <h2 className="font-headline text-[22px] font-semibold text-on-surface mb-0.5">{user?.name || USER.name}</h2>
        <p className="text-[14px] text-on-surface-variant mb-1">{user?.memberLabel || USER.label}</p>
        <a href="/profile/account" className="text-[12px] text-primary font-semibold hover:underline mb-4 flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">edit</span>
          Ubah Profil
        </a>
        <a href={user?.roles?.includes("seller") ? "/store" : "/store/create"} className="w-full py-2.5 bg-secondary text-white rounded-xl text-[13px] font-semibold hover:shadow-float transition-all active:scale-95 flex items-center justify-center gap-2 mb-6">
          <span className="material-symbols-outlined text-[18px]">storefront</span>
          {user?.roles?.includes("seller") ? "Lihat Toko" : "Buat Toko"}
        </a>

        {/* Nav links */}
        <nav className="w-full space-y-1">
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

          <a href="/profile" className="flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-semibold tracking-[0.05em] text-on-surface-variant hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
            Pesanan Saya
          </a>
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
            <a key={link.label} href={link.href} className="flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-semibold tracking-[0.05em] text-on-surface-variant hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined text-[20px]">{link.icon}</span>
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </aside>
  );
}
