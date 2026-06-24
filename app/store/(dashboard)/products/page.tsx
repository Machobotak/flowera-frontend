"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";

export default function StoreProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("/api/seller/product", { withCredentials: true });
        setProducts(res.data?.data || res.data || []);
      } catch (error) {
        console.error("Gagal mengambil data produk", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleDeleteProduct = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
      try {
        await axios.delete(`/api/seller/product/delete?product=${id}`, { withCredentials: true });
        setProducts(products.filter(p => p.id !== parseInt(id)));
      } catch (error) {
        console.error("Gagal menghapus produk", error);
        alert("Gagal menghapus produk");
      }
    }
  };

  const getImageUrl = (product: any) => {
    const images = product.product_image || product.images;
    if (images && images.length > 0) {
      const img = images[0];
      // Backend stores as image_url field
      const url = img.image_url || img.url || img.path || (typeof img === "string" ? img : null);
      if (url) return url;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name || "P")}&background=8c4a5c&color=fff`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-headline text-[24px] font-semibold text-on-surface">Produk Saya</h2>
        <Link
          href="/store/products/create"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-[13px] font-semibold hover:shadow-soft transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Tambah Produk
        </Link>
      </div>

      {isLoading ? (
        <div className="col-span-full py-16 text-center text-on-surface-variant bg-white rounded-2xl shadow-soft border border-outline-variant/20">
          <span className="material-symbols-outlined text-[48px] mb-2 animate-spin">progress_activity</span>
          <p className="text-[14px]">Memuat produk...</p>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white rounded-2xl shadow-soft border border-outline-variant/20">
            <span className="material-symbols-outlined text-[56px] mb-3 text-outline/40">inventory_2</span>
            <p className="text-[16px] font-semibold text-on-surface mb-1">Belum ada produk</p>
            <p className="text-[13px] text-on-surface-variant mb-6">Mulai tambahkan produk bunga pertama Anda</p>
            <Link
              href="/store/products/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl text-[13px] font-semibold hover:shadow-soft transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Tambah Produk Pertama
            </Link>
          </div>
        ) : (
          products.map((product) => (
            <div key={product.id} className="bg-white rounded-2xl overflow-hidden shadow-soft border border-outline-variant/20 group">
              <div className="h-48 overflow-hidden relative bg-surface-container">
                <img src={getImageUrl(product)} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                {/* Life flower badge */}
                <div className="absolute top-3 left-3">
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                    product.isLifeFlower 
                      ? "bg-secondary-container text-on-secondary-container" 
                      : "bg-tertiary-container text-on-tertiary-container"
                  }`}>
                    {product.isLifeFlower ? "🌸 Bunga Asli" : "🌿 Artifisial"}
                  </span>
                </div>
                <button 
                  onClick={() => handleDeleteProduct(String(product.id))}
                  className="absolute top-3 right-3 bg-white/90 p-2 rounded-full text-error shadow-sm hover:scale-110 transition-transform opacity-0 group-hover:opacity-100"
                  title="Hapus Produk"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                </button>
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-on-surface text-[15px] mb-1 truncate">{product.name}</h3>
                <p className="text-primary font-bold text-[14px] mb-3">
                  Rp {typeof product.price === "number" ? product.price.toLocaleString("id-ID") : product.price}
                </p>
                <div className="flex justify-between items-center text-[12px] text-on-surface-variant border-t border-outline-variant/20 pt-3">
                  <span>ID: {product.id}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      )}
    </div>
  );
}

