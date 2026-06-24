"use client";

import React, { useState } from "react";

// Mock data for products
const MOCK_PRODUCTS = [
  {
    id: "PRD-001",
    name: "Red Roses Bouquet",
    price: "Rp 150.000",
    stock: 10,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD8IK4PcX6IdyO4I8wuuwS82VVT2D3Xso1tFQrEe5RcXI_CbBBYcnmSrOjP1WwBPFNhLME0tfOD11jF1IMG_bJfw7Vw8xHbC4YMjTCECm7YHZBFmTMUZVSmkVpuaWou_wgObZhrLdyEYntVmB9ZxfXhEbeJwmz6A0zfAdllpiqUhTj93eeTFzIlhhC5tci4U4n6jZhNOhCTylDA8WL0Mv2stuQxrwfyGAJE80CTUOuHlBmrujokSvRPkdNsi06bK7AX1ML3itSNNgw",
  },
  {
    id: "PRD-002",
    name: "Sunflower Delight",
    price: "Rp 120.000",
    stock: 5,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBOOik4q_tzpN-m1nI7raLcUzJ8qwp2H59K5pOIugQL-JYp2OYTwaYKXke_ig1zRK1DY6dwXr4UwlS3gsANdyL44zXiW2wDqxCWXchmyBFaY381gI1y8K52sIBULn6POyt_JTJtVNTrCCZ0cf6xPJJxcA7vWUyDsFTtWTnq2ulrPuwMLh4WhSW0cOzibOd33ONEgeEoG1bQVpU7DI_ZzuKwaYRa7PXn3Gq6R2U2YdL1zjKFYw5mb8JOWTb3ZFypyhOwEtHYAZUP3wQ",
  },
];

export default function StoreProductsPage() {
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [isAdding, setIsAdding] = useState(false);

  // Form states
  const [newProductName, setNewProductName] = useState("");
  const [newProductPrice, setNewProductPrice] = useState("");

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName || !newProductPrice) return;
    
    const newProduct = {
      id: `PRD-${Math.floor(Math.random() * 1000)}`,
      name: newProductName,
      price: `Rp ${newProductPrice}`,
      stock: 0,
      image: "https://ui-avatars.com/api/?name=Produk&background=random",
    };
    
    setProducts([...products, newProduct]);
    setIsAdding(false);
    setNewProductName("");
    setNewProductPrice("");
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-headline text-[24px] font-semibold text-on-surface">Produk Saya</h2>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-[13px] font-semibold hover:shadow-soft transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Tambah Produk
        </button>
      </div>

      {isAdding && (
        <div className="bg-white rounded-2xl p-6 shadow-soft border border-outline-variant/20 animate-[fadeIn_0.2s_ease]">
          <h3 className="text-[16px] font-bold text-on-surface mb-4">Tambahkan Produk Baru</h3>
          <form onSubmit={handleAddProduct} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full space-y-1">
              <label className="text-[12px] font-semibold text-on-surface-variant">Nama Produk</label>
              <input 
                type="text" 
                required
                value={newProductName}
                onChange={(e) => setNewProductName(e.target.value)}
                placeholder="Contoh: Buket Bunga Mawar" 
                className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[13px] focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="flex-1 w-full space-y-1">
              <label className="text-[12px] font-semibold text-on-surface-variant">Harga (Rp)</label>
              <input 
                type="number" 
                required
                value={newProductPrice}
                onChange={(e) => setNewProductPrice(e.target.value)}
                placeholder="150000" 
                className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[13px] focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <button type="submit" className="px-6 py-3 bg-secondary text-white rounded-xl text-[13px] font-semibold hover:shadow-soft transition-all active:scale-95">
              Simpan
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.length === 0 ? (
          <div className="col-span-full py-12 text-center text-on-surface-variant bg-white rounded-2xl shadow-soft border border-outline-variant/20">
            <span className="material-symbols-outlined text-[48px] mb-2 opacity-50">inventory_2</span>
            <p>Belum ada produk di toko Anda.</p>
          </div>
        ) : (
          products.map((product) => (
            <div key={product.id} className="bg-white rounded-2xl overflow-hidden shadow-soft border border-outline-variant/20 group">
              <div className="h-48 overflow-hidden relative">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <button 
                  onClick={() => handleDeleteProduct(product.id)}
                  className="absolute top-3 right-3 bg-white/90 p-2 rounded-full text-error shadow-sm hover:scale-110 transition-transform"
                  title="Hapus Produk"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                </button>
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-on-surface text-[15px] mb-1 truncate">{product.name}</h3>
                <p className="text-primary font-bold text-[14px] mb-3">{product.price}</p>
                <div className="flex justify-between items-center text-[12px] text-on-surface-variant border-t border-outline-variant/20 pt-3">
                  <span>Stok: {product.stock}</span>
                  <span>ID: {product.id}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
