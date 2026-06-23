"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Anda bisa menyesuaikan tipe ini dengan struktur response API Anda
interface Region {
  id: string | number; 
  name: string;
}

export default function CreateStorePage() {
  const router = useRouter();
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    provinceId: "",
    provinceName: "",
    cityId: "",
    cityName: "",
    districtId: "",
    districtName: "",
    addressDetail: "",
    description: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Region State
  const [provinces, setProvinces] = useState<Region[]>([]);
  const [cities, setCities] = useState<Region[]>([]);
  const [districts, setDistricts] = useState<Region[]>([]);
  
  const [isLoadingRegions, setIsLoadingRegions] = useState({
    provinces: false,
    cities: false,
    districts: false,
  });

  // 1. Fetch Provinces
  useEffect(() => {
    const fetchProvinces = async () => {
      setIsLoadingRegions(prev => ({ ...prev, provinces: true }));
      try {
        // TODO: Isi dengan URL API Provinsi Anda
        const API_PROVINCE = process.env.NEXT_PUBLIC_REGIONAL_API+"/api/provinces"; 
        if (!API_PROVINCE) return;

        const response = await fetch(API_PROVINCE);
        const res = await response.json();
        console.log(res);
        
        // Sesuaikan dengan struktur data response (mengambil properti data)
        setProvinces(res.data || []);
      } catch (error) {
        console.error("Gagal mengambil data provinsi", error);
      } finally {
        setIsLoadingRegions(prev => ({ ...prev, provinces: false }));
      }
    };
    fetchProvinces();
  }, []);

  // 2. Fetch Cities saat Province berubah
  useEffect(() => {
    if (formData.provinceId) {
      const fetchCities = async () => {
        setIsLoadingRegions(prev => ({ ...prev, cities: true }));
        try {
          const API_CITY = `${process.env.NEXT_PUBLIC_REGIONAL_API}/api/regencies/${formData.provinceId}`; 
          if (!API_CITY) return;

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
          const API_DISTRICT = `${process.env.NEXT_PUBLIC_REGIONAL_API}/api/districts/${formData.cityId}`; 
          if (!API_DISTRICT) return;

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Gabungkan seluruh detail alamat menjadi satu string sesuai permintaan
    const fullAddress = `${formData.addressDetail}, Kec. ${formData.districtName}, ${formData.cityName}, Prov. ${formData.provinceName}`;
    
    const payload = {
      name: formData.name,
      address: fullAddress,
      city: formData.cityName,
      description: formData.description,
    };

    console.log("Submitting store data:", payload);

    try {
      // Endpoint API pembuatan toko
      const API_URL = ""; 
      
      if (!API_URL) {
        setTimeout(() => {
          setIsSubmitting(false);
          router.push("/profile");
        }, 1500);
        return;
      }

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Gagal mengirim data pembuatan toko");
      }

      router.push("/profile");
    } catch (error) {
      console.error("Terjadi kesalahan:", error);
      alert("Gagal membuat toko. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-[80vh] flex items-center justify-center py-12 px-margin-mobile md:px-margin-desktop bg-surface">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-soft border border-outline-variant/20 p-8 md:p-12">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-primary-container rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-[32px] text-primary">storefront</span>
          </div>
          <h1 className="font-headline text-[32px] leading-[40px] font-semibold text-on-surface mb-3">
            Buka Toko Bunga Anda
          </h1>
          <p className="text-[14px] text-on-surface-variant max-w-md mx-auto">
            Mulai berjualan dan jangkau lebih banyak pelanggan dengan membuka toko di Flowera.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Store Name */}
          <div className="space-y-2">
            <label htmlFor="name" className="text-[13px] font-semibold text-on-surface-variant">
              Nama Toko
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="Contoh: The Velvet Rose Atelier"
              className="w-full px-5 py-4 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[14px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-outline-variant"
            />
          </div>

          {/* Location Selection */}
          <div className="space-y-4">
            <h3 className="text-[14px] font-bold text-on-surface border-b border-outline-variant/20 pb-2">
              Lokasi Toko
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    required
                    disabled={isLoadingRegions.provinces}
                    value={formData.provinceId}
                    onChange={handleChange}
                    className="w-full px-5 py-3.5 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[13px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer disabled:opacity-60"
                  >
                    <option value="" disabled>Pilih Provinsi</option>
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
                    required
                    disabled={!formData.provinceId || isLoadingRegions.cities}
                    value={formData.cityId}
                    onChange={handleChange}
                    className="w-full px-5 py-3.5 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[13px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer disabled:opacity-60"
                  >
                    <option value="" disabled>Pilih Kota/Kabupaten</option>
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
              <div className="space-y-2 md:col-span-2">
                <label htmlFor="districtId" className="text-[12px] font-semibold text-on-surface-variant flex justify-between">
                  Kecamatan
                  {isLoadingRegions.districts && <span className="text-[10px] text-primary animate-pulse">Memuat...</span>}
                </label>
                <div className="relative">
                  <select
                    id="districtId"
                    name="districtId"
                    required
                    disabled={!formData.cityId || isLoadingRegions.districts}
                    value={formData.districtId}
                    onChange={handleChange}
                    className="w-full px-5 py-3.5 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[13px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer disabled:opacity-60"
                  >
                    <option value="" disabled>Pilih Kecamatan</option>
                    {districts.map((dist) => (
                      <option key={dist.id} value={dist.id}>{dist.name}</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-[20px]">
                    expand_more
                  </span>
                </div>
              </div>
            </div>

            {/* Address Detail */}
            <div className="space-y-2 mt-2">
              <label htmlFor="addressDetail" className="text-[12px] font-semibold text-on-surface-variant">
                Detail Alamat Lengkap
              </label>
              <textarea
                id="addressDetail"
                name="addressDetail"
                required
                rows={2}
                value={formData.addressDetail}
                onChange={handleChange}
                placeholder="Nama jalan, gedung, nomor rumah, RT/RW, dan patokan"
                className="w-full px-5 py-4 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[13px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-outline-variant resize-none"
              />
            </div>
          </div>

          {/* Store Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="text-[13px] font-semibold text-on-surface-variant">
              Deskripsi Toko
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Ceritakan tentang toko Anda, spesialisasi, atau jenis bunga yang Anda jual"
              className="w-full px-5 py-4 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[14px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-outline-variant resize-none"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 rounded-xl text-[14px] font-semibold text-white shadow-soft transition-all flex items-center justify-center gap-2 ${
                isSubmitting 
                  ? "bg-primary/70 cursor-not-allowed" 
                  : "bg-primary hover:shadow-float active:scale-[0.98]"
              }`}
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                  Memproses...
                </>
              ) : (
                <>
                  Buka Toko Sekarang
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </>
              )}
            </button>
          </div>
          
          <p className="text-[12px] text-center text-on-surface-variant mt-4">
            Dengan membuka toko, Anda menyetujui <a href="#" className="text-primary hover:underline font-semibold">Syarat & Ketentuan</a> Flowera.
          </p>
        </form>
      </div>
    </main>
  );
}
