"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useAuth();

  // Guard: only admin role can access
  useEffect(() => {
    if (!isLoading && !user?.roles?.includes("admin")) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  // Determine current menu for top nav
  // NOTE: check longer paths BEFORE shorter ones to avoid false match
  let currentMenu = "Dashboard";
  if (pathname.includes("/sub-categories")) currentMenu = "Sub Kategori";
  else if (pathname.includes("/categories")) currentMenu = "Kategori Produk";
  else if (pathname.includes("/users")) currentMenu = "Users";
  else if (pathname.includes("/sellers")) currentMenu = "Sellers";
  if (pathname.includes("/products")) currentMenu = "Produk";

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        Memuat...
      </div>
    );
  }

  if (!user?.roles?.includes("admin")) {
    return null;
  }

  return (
    <div className="flex h-screen bg-surface-container-lowest overflow-hidden">
      {/* Left Sidebar */}
      <aside className="w-64 bg-white border-r border-outline-variant/20 flex flex-col shadow-soft z-10 hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-outline-variant/20">
          <span className="font-headline font-bold text-[18px] text-primary">
            Admin Center
          </span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link
            href="/admin"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              currentMenu === "Dashboard"
                ? "bg-primary-container text-primary font-bold shadow-sm"
                : "text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            <span
              className="material-symbols-outlined"
              style={
                currentMenu === "Dashboard"
                  ? { fontVariationSettings: "'FILL' 1" }
                  : {}
              }
            >
              dashboard
            </span>
            <span className="text-[14px]">Dashboard</span>
          </Link>

          <Link
            href="/admin/categories"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              currentMenu === "Kategori Produk"
                ? "bg-primary-container text-primary font-bold shadow-sm"
                : "text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            <span
              className="material-symbols-outlined"
              style={
                currentMenu === "Kategori Produk"
                  ? { fontVariationSettings: "'FILL' 1" }
                  : {}
              }
            >
              category
            </span>
            <span className="text-[14px]">Kategori Produk</span>
          </Link>

          <Link
            href="/admin/sub-categories"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              currentMenu === "Sub Kategori"
                ? "bg-primary-container text-primary font-bold shadow-sm"
                : "text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            <span
              className="material-symbols-outlined"
              style={
                currentMenu === "Sub Kategori"
                  ? { fontVariationSettings: "'FILL' 1" }
                  : {}
              }
            >
              label
            </span>
            <span className="text-[14px]">Sub Kategori</span>
          </Link>

          <Link
            href="/admin/users"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              currentMenu === "Users"
                ? "bg-primary-container text-primary font-bold shadow-sm"
                : "text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            <span
              className="material-symbols-outlined"
              style={
                currentMenu === "Users"
                  ? { fontVariationSettings: "'FILL' 1" }
                  : {}
              }
            >
              people
            </span>
            <span className="text-[14px]">Users</span>
          </Link>

          <Link
            href="/admin/sellers"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              currentMenu === "Sellers"
                ? "bg-primary-container text-primary font-bold shadow-sm"
                : "text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            <span
              className="material-symbols-outlined"
              style={
                currentMenu === "Sellers"
                  ? { fontVariationSettings: "'FILL' 1" }
                  : {}
              }
            >
              storefront
            </span>
            <span className="text-[14px]">Sellers</span>
          </Link>

          <Link
            href="/admin/products"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              currentMenu === "Produk"
                ? "bg-primary-container text-primary font-bold shadow-sm"
                : "text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            <span
              className="material-symbols-outlined"
              style={
                currentMenu === "Produk"
                  ? { fontVariationSettings: "'FILL' 1" }
                  : {}
              }
            >
              inventory_2
            </span>
            <span className="text-[14px]">Produk</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-outline-variant/20">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 text-[14px] text-on-surface-variant hover:bg-surface-container rounded-xl transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">
              arrow_back
            </span>
            Kembali ke Beranda
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-outline-variant/20 shadow-sm flex items-center justify-between px-6 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <img
              src="/logo-v1-transparant.png"
              alt="Flowera Logo"
              className="h-6 w-auto"
            />
            <div className="h-6 w-[1px] bg-outline-variant/30 hidden sm:block"></div>
            <h1 className="font-headline font-semibold text-[18px] text-on-surface hidden sm:block">
              {currentMenu}
            </h1>
          </div>

          {/* Admin Info */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-[14px] font-bold text-on-surface leading-tight">
                {user?.name || "Admin"}
              </p>
              <p className="text-[11px] text-primary font-semibold">
                Admin Profile
              </p>
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-primary overflow-hidden bg-surface-container shrink-0">
              <img
                src={
                  user?.avatar ||
                  "https://ui-avatars.com/api/?name=Admin&background=1F4D2E&color=fff"
                }
                alt="Admin Avatar"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-surface-container-lowest p-6 md:p-8">
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
