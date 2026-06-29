"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import ProductCard from "@/components/cards/product-card";
import FloristCard from "@/components/cards/florist-card";
import { useToast } from "@/hooks/use-toast";
import ToastContainer from "@/components/toast-container";

/* ──────────────────────────── Data ──────────────────────────── */


/* ──────────────────────────── Sections ──────────────────────────── */

const HERO_SLIDES = [
  {
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCHU-MNzSwSUbbUPvKZvCkAJnjjr1Q74pczA_BThQ1vmUXiAhigqFmfVM6UJBm6PKYLM6lwwR3NMrcTTLt9dYI6OdgW0NKTbW4t9TA8qu-ZUJaBia7VZ6ym3L57bQlqRQnEc0s2CL8xzuJjMzuFph9CXFRr3tv-TDqJl2Ju2inAm_6q0EVgsVwlto2C5UtHP0eocusr5WBn4VLNDYxwoz6p-itwOP7TBGSVeE-XuAy14jdF2ULjhxN4qEUGFGCz-m7liS_ZWUqg-1Y",
    title: "Seasonal Bloom",
    subtitle: "Collection",
    desc: "Experience the elegance of hand-picked peonies delivered fresh to your doorstep."
  },
  {
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB2gUwgvHVeY6k-Mj9af0voVS5A7taBgEpmlkFTl1zVrhEOYtXz_p2qiRwDkkPYfepg8PZFoARMelNrheS_Sfbk7gimiQT8hYb7mvqWroNJsZWJfRXzN70p5V1vSnIljQcRwcPvUMZoxPB4KpASwBXWz6Z2zi_jo4jghhbkeD6Wq56PRXeXB3QyWkn8VdlTpjSKyJzdX3UfhpWT_yr54S666YNUHSjPPHFKHehPl0B0oX3KWA-UD3jX489q-4DErQXTgD4RjbM-wB0",
    title: "Midnight Grace",
    subtitle: "Premium",
    desc: "A luxurious arrangement of deep purple calla lilies and dark burgundy roses."
  },
  {
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuALi3jtLys9GQK4zuPNTLeK5fH-p66mY-cHWAwD4bB86HAtWgVdzDsyjW0ILgI6Rl7fwyDwrXxOE5IkIo6NArfueTT8wzW5iZnUQYKUNqibjc3HH3X4mmsTmQLolHRVY_SVDTN6wSCyWscb_Akr9nuBg6CWJA1nqSAU0a7-WgNmmWMgJxd_LVZBsV2OEM1uB_ZHItrtYyIHzZ9eZBHmYaDUsC9Ml09B3EDEjzl0zNHW1jrY2nyPKjI-ByOqzX1zcjT5BLmQ86srKGs",
    title: "Golden Hour",
    subtitle: "Vibrant",
    desc: "Brighten someone's day with sunflowers and blue delphiniums."
  }
];

function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 15000); // 15 detik

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full aspect-[4/3] md:aspect-[21/9] rounded-xl overflow-hidden shadow-float group">
      <div 
        className="absolute inset-0 flex transition-transform duration-1000 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {HERO_SLIDES.map((slide, idx) => (
          <div key={idx} className="min-w-full h-full relative">
            <img
              className="w-full h-full object-cover"
              alt={`${slide.title} ${slide.subtitle}`}
              src={slide.image}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-on-surface/60 to-transparent flex items-center px-6 md:px-16">
              <div className="max-w-md text-white">
                <h2 className="text-[20px] md:text-[36px] font-headline font-bold mb-2 md:mb-4 leading-tight">
                  {slide.title} <br />
                  <span className="text-primary-fixed">{slide.subtitle}</span>
                </h2>
                <p className="text-[12px] md:text-[16px] mb-4 md:mb-8 opacity-90 drop-shadow-md">
                  {slide.desc}
                </p>
                <button className="px-5 py-2.5 md:px-8 md:py-4 bg-primary-container text-on-primary-container text-[12px] md:text-[14px] font-semibold rounded-full shadow-lg hover:scale-105 transition-transform">
                  Shop The Collection
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {HERO_SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`h-2 rounded-full transition-all duration-500 ${
              currentSlide === idx ? "w-8 bg-white" : "w-2 bg-white/40 hover:bg-white/60"
            }`}
          />
        ))}
      </div>
    </section>
  );
}

function ExploreSection() {
  const [activeTab, setActiveTab] = useState<"products" | "florists">("products");
  const { toasts, addToast, removeToast } = useToast();

  // State untuk menyimpan data dari backend
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [products, setProducts] = useState<any[]>([]);       // semua produk (dari /home)
  const [categoryProducts, setCategoryProducts] = useState<any[] | null>(null); // produk hasil filter API
  const [isLoadingCategory, setIsLoadingCategory] = useState(false);
  const [florists, setFlorists] = useState<any[]>([]);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const API_URL = "/api/user/home";
        // Menambahkan parameter 't' dengan timestamp mencegah browser melakukan cache pada data yang diambil
        const res = await axios.get(`${API_URL}?t=${new Date().getTime()}`);

        // Gunakan data dari endpoint backend
        const data = res.data;

        setCategories(data.productCategories || []);
        setProducts(data.product || []);
        setFlorists(data.store || []);
      } catch (error) {
        addToast("Gagal memuat data beranda. Silakan coba lagi.", "error");
      }
    };

    fetchHomeData();
  }, []);

  // Fetch produk berdasarkan kategori yang dipilih
  useEffect(() => {
    if (selectedCategory === null) {
      setCategoryProducts(null); // pakai semua produk
      return;
    }

    let cancelled = false;
    const fetchCategoryProducts = async () => {
      setIsLoadingCategory(true);
      try {
        const res = await axios.get(`/api/user/product/categories/${selectedCategory}`, {
          withCredentials: true,
        });
        const data: any[] = res.data?.data ?? res.data ?? [];
        if (!cancelled) setCategoryProducts(data);
      } catch (error) {
        if (!cancelled) { addToast("Gagal memuat produk kategori.", "error"); setCategoryProducts([]); }
      } finally {
        if (!cancelled) setIsLoadingCategory(false);
      }
    };

    fetchCategoryProducts();
    return () => { cancelled = true; };
  }, [selectedCategory]);

  const getImageUrl = (item: any): string => {
    // Cek product_image / images array dulu (format produk)
    const images = item.product_image || item.images;
    if (images && images.length > 0) {
      const img = images.find((i: any) => i.isDefault || i.is_default) || images[0];
      const path = img.image_url || img.url || img.path || (typeof img === "string" ? img : null);
      if (path) {
        if (path.startsWith("http")) return path;
        const baseUrl = process.env.NEXT_PUBLIC_ACCESS_FILE_STORAGE || "http://192.168.3.23";
        return path.startsWith("/") ? `${baseUrl}${path}` : `${baseUrl}/${path}`;
      }
    }
    // Fallback: product.image atau store.logo
    const path = item.image || item.logo;
    if (path) {
      if (path.startsWith("http")) return path;
      const baseUrl = process.env.NEXT_PUBLIC_ACCESS_FILE_STORAGE || "http://192.168.3.23";
      return path.startsWith("/") ? `${baseUrl}${path}` : `${baseUrl}/${path}`;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name || "P")}&background=8c4a5c&color=fff`;
  };

  // Pilih source produk: dari API kategori atau dari /home
  const displayProducts = selectedCategory !== null && categoryProducts !== null
    ? categoryProducts
    : products;

  return (
    <section className="space-y-6">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      {/* Category Chips - Only for products */}
      {activeTab === "products" && (
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex items-center justify-between">
            <h4 className="font-headline-md text-headline-md">
              Belanja Sesuai Kebutuhan
            </h4>
            <a className="text-primary font-label-md hover:underline" href="#">
              Lihat Semua
            </a>
          </div>

          <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`flex items-center gap-3 px-6 py-3 rounded-full whitespace-nowrap transition-colors border ${
                selectedCategory === null
                  ? "bg-primary text-white border-primary"
                  : "bg-surface border-outline-variant/30 text-on-surface hover:bg-primary-container/10"
              }`}
            >
              <span className="font-label-md">Semua</span>
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-3 px-6 py-3 rounded-full whitespace-nowrap transition-colors border ${
                  selectedCategory === cat.id
                    ? "bg-primary text-white border-primary"
                    : "bg-surface border-outline-variant/30 text-on-surface hover:bg-primary-container/10"
                }`}
              >
                <span className="font-label-md">{cat.title}</span>
              </button>
            ))}
            <button className="flex items-center gap-3 px-6 py-3 bg-primary text-white rounded-full whitespace-nowrap hover:opacity-90 transition-colors">
              <span className="material-symbols-outlined">brush</span>
              <span className="font-label-md">Custom Bouquet</span>
            </button>
          </div>
        </div>
      )}

      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex gap-2 p-1 bg-surface-container-low rounded-xl w-fit border border-outline-variant/20">
          <button
            onClick={() => setActiveTab("products")}
            className={`px-6 py-2.5 rounded-lg text-[14px] font-semibold transition-all ${
              activeTab === "products"
                ? "bg-white text-primary shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Trending Bouquets
          </button>
          <button
            onClick={() => setActiveTab("florists")}
            className={`px-6 py-2.5 rounded-lg text-[14px] font-semibold transition-all ${
              activeTab === "florists"
                ? "bg-white text-primary shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Nearby Florists
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="animate-[fadeIn_0.3s_ease]">
        {activeTab === "products" ? (
          isLoadingCategory ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <span className="material-symbols-outlined text-[48px] text-on-surface-variant mb-4 animate-spin">progress_activity</span>
              <p className="text-on-surface-variant text-[14px]">Memuat produk...</p>
            </div>
          ) : displayProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 xl:gap-5">
              {displayProducts
                .filter((p: any) => {
                  const hasStore = p.store?.name && p.store.name !== "Unknown";
                  const hasName = p.name && p.name !== "Unknown";
                  return hasStore && hasName;
                })
                .map((product) => (
                <ProductCard
                  key={product.id}
                  name={product.name}
                  florist={product.store?.name || product.sub_product_categories?.title || "Unknown Florist"}
                  price={`Rp ${product.price.toLocaleString("id-ID")}`}
                  rating={product.rating > 0 ? product.rating.toString() : "Baru"}
                  location={product.store?.city || "Unknown"}
                  sold="0 terjual"
                  image={getImageUrl(product)}
                  imageAlt={product.name}
                  href={`/product/${product.id}`}
                />
              ))}
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-outline-variant/20 shadow-soft">
              <span className="material-symbols-outlined text-[64px] text-outline mb-4 opacity-50">search_off</span>
              <h3 className="font-headline font-bold text-on-surface text-[18px]">Belum ada produk di kategori ini</h3>
              <p className="text-on-surface-variant text-[14px] mt-2">Coba pilih kategori lain atau lihat semua produk.</p>
            </div>
          )
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {florists.map((florist) => (
              <FloristCard
                key={florist.id}
                name={florist.name}
                location={florist.city || "Unknown City"}
                distance="Dekat Anda"
                avatar={getImageUrl(florist)}
                avatarAlt={florist.name}
              />
            ))}
          </div>
        )}
      </div>

      {/* Load More Indicator */}
      {((activeTab === "products" && displayProducts.length >= 50) ||
        (activeTab === "florists" && florists.length >= 50)) && (
        <div className="flex justify-center pt-8 pb-4">
          <button className="px-8 py-3 border-2 border-primary text-primary font-semibold rounded-full hover:bg-primary-container/20 transition-colors">
            Muat Lebih Banyak
          </button>
        </div>
      )}
    </section>
  );
}

/* ──────────────────────────── Page ──────────────────────────── */

export default function Home() {
  return (
    <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop space-y-stack-lg py-stack-md pb-20 md:pb-16">
      <HeroCarousel />
      <ExploreSection />
    </main>
  );
}