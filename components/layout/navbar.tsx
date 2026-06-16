"use client";

import React, { useState, useRef, useEffect } from "react";

/* ──────────────────────────── Types ──────────────────────────── */

interface NavbarProps {
  isLoggedIn?: boolean;
  user?: {
    name: string;
    avatar: string;
    memberLabel?: string;
  };
}

/* ──────────────────────────── Constants ──────────────────────────── */

const FILL_STYLE = { fontVariationSettings: "'FILL' 1" } as const;

const MOBILE_NAV_ITEMS = [
  { icon: "home", label: "Home", href: "/", active: true },
  { icon: "grid_view", label: "Categories", href: "#" },
  { icon: "local_mall", label: "Orders", href: "/profile" },
  { icon: "person", label: "Profile", href: "/profile" },
];

const USER_MENU_ITEMS = [
  { icon: "person", label: "Akun Saya", href: "/profile" },
  { icon: "shopping_bag", label: "Pesanan Saya", href: "/profile" },
  { icon: "favorite", label: "Wishlist", href: "#" },
  { icon: "confirmation_number", label: "Voucher", href: "#" },
  { icon: "settings", label: "Pengaturan", href: "#" },
];

/* ──────────────────────────── Component ──────────────────────────── */

export default function Navbar({ isLoggedIn = false, user }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  return (
    <>
      {/* Desktop Header */}
      <header className="sticky top-0 w-full z-50 shadow-sm bg-surface/90 backdrop-blur-md">
        <div className="flex items-center justify-between px-margin-desktop py-4 max-w-container-max mx-auto gap-8">
          {/* Brand */}
          <a
            className="shrink-0"
            href="/"
          >
            <img src="/logo-v1.png" alt="Flowera" className="h-7 w-auto" />
          </a>

          {/* Search Bar */}
          <div className="flex-grow max-w-2xl relative">
            <input
              className="w-full bg-surface-container-low border-none rounded-xl px-12 py-3 focus:ring-2 focus:ring-primary/20 font-body-md text-on-surface-variant transition-all"
              placeholder="Search for bouquets, florists, or occasions..."
              type="text"
            />
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
              search
            </span>
          </div>

          {/* Trailing Actions */}
          <div className="flex items-center gap-6 shrink-0">
            <div className="flex gap-4 border-r border-outline-variant/30 pr-6">
              <a href="/cart" className="relative hover:opacity-80 transition-opacity">
                <span className="material-symbols-outlined text-on-surface-variant">
                  shopping_cart
                </span>
                <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  2
                </span>
              </a>
              <button className="hover:opacity-80 transition-opacity">
                <span className="material-symbols-outlined text-on-surface-variant">
                  notifications
                </span>
              </button>
            </div>

            {/* ── Auth Section ── */}
            {isLoggedIn && user ? (
              /* Logged-in: Avatar + Dropdown */
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-3 hover:opacity-90 transition-opacity"
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-container">
                    <img
                      alt={user.name}
                      src={user.avatar}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-[13px] font-semibold text-on-surface leading-4">
                      {user.name}
                    </p>
                    {user.memberLabel && (
                      <p className="text-[10px] text-on-surface-variant">
                        {user.memberLabel}
                      </p>
                    )}
                  </div>
                  <span className={`material-symbols-outlined text-on-surface-variant text-[18px] transition-transform ${menuOpen ? "rotate-180" : ""}`}>
                    expand_more
                  </span>
                </button>

                {/* Dropdown */}
                {menuOpen && (
                  <div className="absolute right-0 top-14 w-56 bg-white rounded-xl shadow-float border border-outline-variant/20 overflow-hidden animate-[fadeIn_0.2s_ease] z-50">
                    {/* User header */}
                    <div className="px-4 py-3 border-b border-outline-variant/20 bg-surface-container-low">
                      <p className="text-[13px] font-semibold text-on-surface">{user.name}</p>
                      {user.memberLabel && (
                        <p className="text-[11px] text-primary font-medium">{user.memberLabel}</p>
                      )}
                    </div>

                    {/* Menu items */}
                    <div className="py-1">
                      {USER_MENU_ITEMS.map((item) => (
                        <a
                          key={item.label}
                          href={item.href}
                          className="flex items-center gap-3 px-4 py-2.5 text-[13px] text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
                          onClick={() => setMenuOpen(false)}
                        >
                          <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                          {item.label}
                        </a>
                      ))}
                    </div>

                    {/* Logout */}
                    <div className="border-t border-outline-variant/20 py-1">
                      <button className="flex items-center gap-3 px-4 py-2.5 text-[13px] text-error hover:bg-error-container/20 w-full transition-colors">
                        <span className="material-symbols-outlined text-[18px]">logout</span>
                        Keluar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Not logged-in: Login & Register buttons */
              <div className="flex gap-3">
                <a href="/login" className="px-5 py-2 font-label-md text-primary hover:bg-primary-container/20 rounded-xl transition-all">
                  Masuk
                </a>
                <a href="/register" className="px-5 py-2 font-label-md bg-primary text-white rounded-xl shadow-soft hover:shadow-float active:scale-95 transition-all">
                  Daftar
                </a>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-3 pb-safe bg-surface shadow-[0_-4px_12px_rgba(31,77,46,0.08)] md:hidden rounded-t-xl">
        {MOBILE_NAV_ITEMS.map((item) => (
          <a
            key={item.label}
            className={`flex flex-col items-center justify-center ${
              item.active
                ? "text-primary bg-primary-container/20 rounded-full px-4 py-1"
                : "text-on-surface-variant"
            }`}
            href={item.href}
          >
            <span
              className="material-symbols-outlined"
              style={item.active ? FILL_STYLE : undefined}
            >
              {item.icon}
            </span>
            <span className="font-label-sm text-[10px]">{item.label}</span>
          </a>
        ))}
      </nav>
    </>
  );
}
