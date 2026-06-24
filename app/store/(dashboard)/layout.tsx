"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import axios from "axios";

export default function StoreDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useAuth();
  
  const [storeInfo, setStoreInfo] = useState<{
    name: string;
    logo_url?: string;
  } | null>(null);

  // Fetch store detail
  useEffect(() => {
    const fetchStoreDetail = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
        const res = await axios.get(`${API_URL}/api/seller/store/detail`, {
          withCredentials: true,
        });
        
        if (res.data) {
          setStoreInfo(res.data);
        }
      } catch (error) {
        console.error("Gagal mengambil info toko", error);
        // Fallback or handle unauthorized
      }
    };

    if (user?.roles?.includes("seller")) {
      fetchStoreDetail();
    } else if (!isLoading && !user?.roles?.includes("seller")) {
      // If not seller, redirect to create store
      router.push("/store/create");
    }
  }, [user, isLoading, router]);

  // Determine current menu for top nav
  let currentMenu = "Dashboard";
  if (pathname.includes("/orders")) currentMenu = "Pesanan";
  if (pathname.includes("/products")) currentMenu = "Produk";
  if (pathname.includes("/profile")) currentMenu = "Toko";

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-surface">Memuat...</div>;
  }

  return (
    <div className="flex h-screen bg-surface-container-lowest overflow-hidden">
      {/* Left Sidebar */}
      <aside className="w-64 bg-white border-r border-outline-variant/20 flex flex-col shadow-soft z-10 hidden md:flex">
        {/* Empty space at top for alignment or custom branding if needed */}
        <div className="h-16 flex items-center px-6 border-b border-outline-variant/20">
          <span className="font-headline font-bold text-[18px] text-primary">Seller Center</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link
            href="/store"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              currentMenu === "Dashboard"
                ? "bg-primary-container text-primary font-bold shadow-sm"
                : "text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            <span className="material-symbols-outlined" style={currentMenu === "Dashboard" ? { fontVariationSettings: "'FILL' 1" } : {}}>dashboard</span>
            <span className="text-[14px]">Dashboard</span>
          </Link>
          
          <Link
            href="/store/orders"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              currentMenu === "Pesanan"
                ? "bg-primary-container text-primary font-bold shadow-sm"
                : "text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            <span className="material-symbols-outlined" style={currentMenu === "Pesanan" ? { fontVariationSettings: "'FILL' 1" } : {}}>local_mall</span>
            <span className="text-[14px]">Pesanan</span>
          </Link>

          <Link
            href="/store/products"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              currentMenu === "Produk"
                ? "bg-primary-container text-primary font-bold shadow-sm"
                : "text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            <span className="material-symbols-outlined" style={currentMenu === "Produk" ? { fontVariationSettings: "'FILL' 1" } : {}}>inventory_2</span>
            <span className="text-[14px]">Produk</span>
          </Link>

          <Link
            href="/store/profile"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              currentMenu === "Toko"
                ? "bg-primary-container text-primary font-bold shadow-sm"
                : "text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            <span className="material-symbols-outlined" style={currentMenu === "Toko" ? { fontVariationSettings: "'FILL' 1" } : {}}>store</span>
            <span className="text-[14px]">Toko</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-outline-variant/20">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 text-[14px] text-on-surface-variant hover:bg-surface-container rounded-xl transition-all">
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            Kembali ke Beranda
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-outline-variant/20 shadow-sm flex items-center justify-between px-6 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <img src="/logo-v1-transparant.png" alt="Flowera Logo" className="h-6 w-auto" />
            <div className="h-6 w-[1px] bg-outline-variant/30 hidden sm:block"></div>
            <h1 className="font-headline font-semibold text-[18px] text-on-surface hidden sm:block">
              {currentMenu}
            </h1>
          </div>

          {/* Store Info */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-[14px] font-bold text-on-surface leading-tight">
                {storeInfo?.name || "Toko Anda"}
              </p>
              <p className="text-[11px] text-primary font-semibold">Seller Profile</p>
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-primary overflow-hidden bg-surface-container">
              <img 
                src={storeInfo?.logo_url || "https://ui-avatars.com/api/?name=Toko&background=1F4D2E&color=fff"} 
                alt="Store Logo" 
                className="w-full h-full object-cover" 
              />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-surface-container-lowest p-6 md:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
