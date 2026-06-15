"use client";

import React from "react";

const MOBILE_NAV_ITEMS = [
  { icon: "home", label: "Home", href: "#", active: true },
  { icon: "grid_view", label: "Categories", href: "#" },
  { icon: "local_mall", label: "Orders", href: "#" },
  { icon: "person", label: "Profile", href: "#" },
];

export default function Navbar() {
  return (
    <>
      {/* Desktop Header */}
      <header className="sticky top-0 w-full z-50 shadow-sm bg-surface/90 backdrop-blur-md">
        <div className="flex items-center justify-between px-margin-desktop py-4 max-w-container-max mx-auto gap-8">
          {/* Brand */}
          <a
            className="font-headline-md text-headline-md font-bold text-primary tracking-tight shrink-0"
            href="#"
          >
            FloraGrace
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
              <button className="hover:opacity-80 transition-opacity">
                <span className="material-symbols-outlined text-on-surface-variant">
                  account_circle
                </span>
              </button>
            </div>

            <div className="flex gap-3">
              <a href="/login" className="px-5 py-2 font-label-md text-primary hover:bg-primary-container/20 rounded-xl transition-all">
                Masuk
              </a>
              <a href="/register" className="px-5 py-2 font-label-md bg-primary text-white rounded-xl shadow-soft hover:shadow-float active:scale-95 transition-all">
                Daftar
              </a>
            </div>
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
              style={item.active ? { fontVariationSettings: "'FILL' 1" } : undefined}
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
