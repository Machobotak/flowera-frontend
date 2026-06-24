"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";

export default function StoreProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [storeData, setStoreData] = useState<any>(null);

  // Logo upload state
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    city: "",
    type: "",
    logo: "",
  });

  const fetchStoreProfile = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`/api/seller/store/detail`, { withCredentials: true });
      
      const data = res.data.data;

      setStoreData(data);
      setFormData({
        name: data.name || "",
        description: data.description || "",
        address: data.address || "",
        city: data.city || "",
        type: data.type || "",
        logo: data.logo || "",
      });
    } catch (error) {
      console.error("Failed to fetch store profile", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStoreProfile();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
    try {
      let uploadedLogoUrl = formData.logo;

      // Jika ada file logo baru, upload ke endpoint upload gambar terlebih dahulu
      if (logoFile) {
        const uploadData = new FormData();
        uploadData.append("file", logoFile); // TODO: Sesuaikan dengan key yang diminta backend

        const uploadRes = await axios.post(`/api/seller/store/upload/logo`, uploadData, {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        });

        console.log("Response Upload Logo:", uploadRes.data);
      } 
      
      // Update form text data
      const res = await axios.put(`/api/seller/store/update`, formData, {
        withCredentials: true 
      });

      if (res.data.status === "success") {
        setIsEditing(false);
        setLogoFile(null);
        setLogoPreview(null);
        
        // Refresh profile data dari backend untuk mendapatkan URL foto terbaru
        await fetchStoreProfile();
      }
    } catch (error) {
      console.error("Gagal mengupdate profil toko", error);
    }
  };


  const getImageUrl = (path: string | null) => {
    if (!path) return "https://ui-avatars.com/api/?name=Store&background=random";
    if (path.startsWith("http")) return path;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    return path.startsWith("/") ? `${baseUrl}${path}` : `${baseUrl}/${path}`;
  };

  if (isLoading) {
    return <div className="text-center py-12">Memuat profil toko...</div>;
  }

  if (!storeData) {
    return <div className="text-center py-12">Data toko tidak ditemukan.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-headline font-bold text-[24px] text-on-surface">Profil Toko</h2>
          <p className="text-on-surface-variant text-[14px]">Kelola informasi dan detail toko Anda</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
            <span className="font-label-md">Edit Profil</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-soft border border-outline-variant/20">
        {!isEditing ? (
          <div className="space-y-8">
            {/* Header Info */}
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 rounded-full border-4 border-surface-container overflow-hidden shrink-0">
                <img
                  src={getImageUrl(storeData.logo)}
                  alt="Store Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-2 pt-2">
                <h3 className="font-headline font-bold text-[22px] text-on-surface flex items-center gap-2">
                  {storeData.name}
                  <span className="px-2 py-0.5 bg-secondary-container text-on-secondary-container text-[12px] rounded-full font-semibold">
                    {storeData.type}
                  </span>
                </h3>
                <p className="text-on-surface-variant flex items-center gap-1 text-[14px]">
                  <span className="material-symbols-outlined text-[16px]">location_on</span>
                  {storeData.city}
                </p>
                <div className="flex gap-4 pt-2">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[#FFB129] text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="font-bold text-[14px]">{storeData.rating > 0 ? storeData.rating : "Baru"}</span>
                  </div>
                  <div className="flex items-center gap-1 text-on-surface-variant text-[14px]">
                    <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                    Bergabung sejak {new Date(storeData.createdAt).toLocaleDateString("id-ID", { month: "short", year: "numeric" })}
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-outline-variant/20">
              <div className="space-y-6">
                <div>
                  <h4 className="font-label-md text-outline mb-1 text-[12px] uppercase tracking-wider">Deskripsi Toko</h4>
                  <p className="text-on-surface text-[15px] leading-relaxed">
                    {storeData.description || "Belum ada deskripsi toko."}
                  </p>
                </div>
                <div>
                  <h4 className="font-label-md text-outline mb-1 text-[12px] uppercase tracking-wider">Tipe Toko</h4>
                  <p className="text-on-surface text-[15px] font-medium">{storeData.type}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="font-label-md text-outline mb-1 text-[12px] uppercase tracking-wider">Alamat Lengkap</h4>
                  <p className="text-on-surface text-[15px] leading-relaxed">
                    {storeData.address || "-"}
                  </p>
                </div>
                <div>
                  <h4 className="font-label-md text-outline mb-1 text-[12px] uppercase tracking-wider">Kota / Kabupaten</h4>
                  <p className="text-on-surface text-[15px] font-medium">{storeData.city || "-"}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Logo Upload Section */}
            <div className="flex items-center gap-6 mb-2">
              <div className="w-24 h-24 rounded-full border-4 border-surface-container overflow-hidden shrink-0 relative group">
                <img
                  src={logoPreview || getImageUrl(formData.logo)}
                  alt="Store Logo Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center transition-all cursor-pointer">
                  <label htmlFor="logo-upload" className="cursor-pointer flex flex-col items-center justify-center w-full h-full">
                    <span className="material-symbols-outlined text-white text-[24px]">photo_camera</span>
                  </label>
                </div>
              </div>
              <div>
                <label htmlFor="logo-upload" className="px-4 py-2 bg-surface border border-outline-variant/50 rounded-lg text-primary font-label-md cursor-pointer hover:bg-surface-container transition-colors inline-block mb-2">
                  Ganti Logo Toko
                </label>
                <input
                  type="file"
                  id="logo-upload"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoChange}
                />
                <p className="text-[12px] text-on-surface-variant">Format .jpg, .png, .jpeg (Max. 2MB)</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-[14px] font-medium text-on-surface mb-2">Nama Toko</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[14px] font-medium text-on-surface mb-2">Deskripsi Toko</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors resize-none"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-[14px] font-medium text-on-surface">Tipe Toko</label>
                    <span className="text-[10px] bg-surface-container-high text-on-surface-variant px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">lock</span>
                      Ditentukan Admin
                    </span>
                  </div>
                  <select
                    name="type"
                    value={formData.type}
                    disabled
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant/50 bg-surface-container-low text-on-surface-variant opacity-80 cursor-not-allowed outline-none transition-colors"
                  >
                    <option value="TOKO">TOKO Biasa</option>
                    <option value="MALL">MALL / Official</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[14px] font-medium text-on-surface mb-2">Kota</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[14px] font-medium text-on-surface mb-2">Alamat Lengkap</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-outline-variant/20">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-6 py-2.5 border border-outline-variant/50 text-on-surface font-label-md rounded-lg hover:bg-surface-container transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-primary text-white font-label-md rounded-lg hover:bg-primary/90 transition-colors"
              >
                Simpan Perubahan
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
