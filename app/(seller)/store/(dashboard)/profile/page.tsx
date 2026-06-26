"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import ToastContainer from "@/components/toast-container";

interface Region {
  id: string | number; 
  name: string;
}

export default function StoreProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [storeData, setStoreData] = useState<any>(null);

  const { toasts, addToast, removeToast } = useToast();

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
    // Regional state for editing
    provinceId: "",
    provinceName: "",
    cityId: "",
    cityName: "",
    districtId: "",
    districtName: "",
    addressDetail: "",
  });

  // Region State
  const [provinces, setProvinces] = useState<Region[]>([]);
  const [cities, setCities] = useState<Region[]>([]);
  const [districts, setDistricts] = useState<Region[]>([]);
  
  const [isLoadingRegions, setIsLoadingRegions] = useState({
    provinces: false,
    cities: false,
    districts: false,
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
        provinceId: "",
        provinceName: "",
        cityId: "",
        cityName: "",
        districtId: "",
        districtName: "",
        addressDetail: "",
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

  // 1. Fetch Provinces
  useEffect(() => {
    if (!isEditing) return;
    const fetchProvinces = async () => {
      setIsLoadingRegions(prev => ({ ...prev, provinces: true }));
      try {
        const API_PROVINCE = "/regional-api/provinces"; 
        const response = await fetch(API_PROVINCE);
        const res = await response.json();
        setProvinces(res.data || []);
      } catch (error) {
        console.error("Gagal mengambil data provinsi", error);
      } finally {
        setIsLoadingRegions(prev => ({ ...prev, provinces: false }));
      }
    };
    if (provinces.length === 0) fetchProvinces();
  }, [isEditing]);

  // 2. Fetch Cities saat Province berubah
  useEffect(() => {
    if (formData.provinceId) {
      const fetchCities = async () => {
        setIsLoadingRegions(prev => ({ ...prev, cities: true }));
        try {
          const API_CITY = `/regional-api/cities/${formData.provinceId}`; 
          const response = await fetch(API_CITY);
          const res = await response.json();
          setCities(res.data || []);
        } catch (error) {
          console.error("Gagal mengambil data kota", error);
        } finally {
          setIsLoadingRegions(prev => ({ ...prev, cities: false }));
        }
      };
      fetchCities();
    } else {
      setCities([]);
    }
  }, [formData.provinceId]);

  // 3. Fetch Districts saat City berubah
  useEffect(() => {
    if (formData.cityId) {
      const fetchDistricts = async () => {
        setIsLoadingRegions(prev => ({ ...prev, districts: true }));
        try {
          const API_DISTRICT = `/regional-api/districts/${formData.cityId}`; 
          const response = await fetch(API_DISTRICT);
          const res = await response.json();
          setDistricts(res.data || []);
        } catch (error) {
          console.error("Gagal mengambil data kecamatan", error);
        } finally {
          setIsLoadingRegions(prev => ({ ...prev, districts: false }));
        }
      };
      fetchDistricts();
    } else {
      setDistricts([]);
    }
  }, [formData.cityId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      
      // Jika provinsi berubah, ambil nama provinsi & reset kota dan kecamatan
      if (name === "provinceId") {
        const selectedProv = provinces.find(p => p.id.toString() === value);
        newData.provinceName = selectedProv ? selectedProv.name : "";
        newData.cityId = "";
        newData.cityName = "";
        newData.districtId = "";
        newData.districtName = "";
      } 
      // Jika kota berubah, ambil nama kota & reset kecamatan
      else if (name === "cityId") {
        const selectedCity = cities.find(c => c.id.toString() === value);
        newData.cityName = selectedCity ? selectedCity.name : "";
        newData.districtId = "";
        newData.districtName = "";
      }
      // Jika kecamatan berubah, ambil nama kecamatan
      else if (name === "districtId") {
        const selectedDist = districts.find(d => d.id.toString() === value);
        newData.districtName = selectedDist ? selectedDist.name : "";
      }
      
      return newData;
    });
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
          withCredentials: true,
        });

        console.log("Response Upload Logo:", uploadRes.data);
      } 
      
      // Update form text data
      // Jangan kirim state 'logo' lama agar tidak menimpa logo yang baru diupload di database
      const { logo, ...restData } = formData;
      const submitData: any = { ...restData };
      
      // Jika user mengisi lokasi baru menggunakan form region
      if (formData.provinceId && formData.cityId && formData.districtId && formData.addressDetail) {
        submitData.address = `${formData.addressDetail}, Kec. ${formData.districtName}, ${formData.cityName}, Prov. ${formData.provinceName}`;
        submitData.city = formData.cityName;
      }

      const res = await axios.put(`/api/seller/store/update`, submitData, {
        withCredentials: true 
      });

      if (res.data.status === "success") {
        setIsEditing(false);
        setLogoFile(null);
        setLogoPreview(null);
        addToast("Profil toko berhasil diperbarui", "success");
        // Delay reload agar toast sempat terlihat
        setTimeout(() => window.location.reload(), 800);
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || "Gagal mengupdate profil toko";
      addToast(msg, "error");
    }
  };


  const getImageUrl = (path: string | null) => {
    if (!path) return "https://ui-avatars.com/api/?name=Store&background=random";
    if (path.startsWith("http")) return path;
    const baseUrl = process.env.NEXT_PUBLIC_ACCESS_FILE_STORAGE || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    const fullPath = path.startsWith("/") ? `${baseUrl}${path}` : `${baseUrl}/${path}`;
    // Tambahkan timestamp untuk menghindari cache gambar rusak yang disimpan browser
    return `${fullPath}?t=${new Date().getTime()}`;
  };

  if (isLoading) {
    return <div className="text-center py-12">Memuat profil toko...</div>;
  }

  if (!storeData) {
    return <div className="text-center py-12">Data toko tidak ditemukan.</div>;
  }

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
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

                <div className="pt-2 border-t border-outline-variant/30 mt-4">
                  <div className="mb-4">
                    <h3 className="text-[14px] font-bold text-on-surface">Ubah Lokasi Toko</h3>
                    <p className="text-[12px] text-on-surface-variant">Biarkan kosong jika tidak ingin mengubah lokasi saat ini ({formData.city}).</p>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Province */}
                    <div className="space-y-2">
                      <label htmlFor="provinceId" className="text-[12px] font-semibold text-on-surface-variant flex justify-between">
                        Provinsi
                        {isLoadingRegions.provinces && <span className="text-[10px] text-primary animate-pulse">Memuat...</span>}
                      </label>
                      <div className="relative">
                        <select
                          id="provinceId"
                          name="provinceId"
                          disabled={isLoadingRegions.provinces}
                          value={formData.provinceId}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 rounded-xl text-[13px] focus:ring-1 focus:ring-primary focus:border-primary transition-all appearance-none cursor-pointer disabled:opacity-60"
                        >
                          <option value="">Pilih Provinsi</option>
                          {provinces.map((prov) => (
                            <option key={prov.id} value={prov.id}>{prov.name}</option>
                          ))}
                        </select>
                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-[20px]">
                          expand_more
                        </span>
                      </div>
                    </div>

                    {/* City */}
                    <div className="space-y-2">
                      <label htmlFor="cityId" className="text-[12px] font-semibold text-on-surface-variant flex justify-between">
                        Kota / Kabupaten
                        {isLoadingRegions.cities && <span className="text-[10px] text-primary animate-pulse">Memuat...</span>}
                      </label>
                      <div className="relative">
                        <select
                          id="cityId"
                          name="cityId"
                          disabled={!formData.provinceId || isLoadingRegions.cities}
                          value={formData.cityId}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 rounded-xl text-[13px] focus:ring-1 focus:ring-primary focus:border-primary transition-all appearance-none cursor-pointer disabled:opacity-60"
                        >
                          <option value="">Pilih Kota/Kabupaten</option>
                          {cities.map((city) => (
                            <option key={city.id} value={city.id}>{city.name}</option>
                          ))}
                        </select>
                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-[20px]">
                          expand_more
                        </span>
                      </div>
                    </div>

                    {/* District */}
                    <div className="space-y-2">
                      <label htmlFor="districtId" className="text-[12px] font-semibold text-on-surface-variant flex justify-between">
                        Kecamatan
                        {isLoadingRegions.districts && <span className="text-[10px] text-primary animate-pulse">Memuat...</span>}
                      </label>
                      <div className="relative">
                        <select
                          id="districtId"
                          name="districtId"
                          disabled={!formData.cityId || isLoadingRegions.districts}
                          value={formData.districtId}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 rounded-xl text-[13px] focus:ring-1 focus:ring-primary focus:border-primary transition-all appearance-none cursor-pointer disabled:opacity-60"
                        >
                          <option value="">Pilih Kecamatan</option>
                          {districts.map((dist) => (
                            <option key={dist.id} value={dist.id}>{dist.name}</option>
                          ))}
                        </select>
                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-[20px]">
                          expand_more
                        </span>
                      </div>
                    </div>

                    {/* Address Detail */}
                    <div className="space-y-2">
                      <label htmlFor="addressDetail" className="text-[12px] font-semibold text-on-surface-variant">
                        Detail Alamat Lengkap
                      </label>
                      <textarea
                        id="addressDetail"
                        name="addressDetail"
                        rows={2}
                        value={formData.addressDetail}
                        onChange={handleInputChange}
                        placeholder="Nama jalan, gedung, nomor rumah, RT/RW, dan patokan"
                        className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 rounded-xl text-[13px] focus:ring-1 focus:ring-primary focus:border-primary transition-all placeholder:text-outline-variant resize-none"
                      />
                    </div>
                  </div>
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
