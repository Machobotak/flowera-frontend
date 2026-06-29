"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import ToastContainer from "@/components/toast-container";
import DeleteConfirmModal from "@/components/seller-product/delete-confirm-modal";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

function authConfig() {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  return {
    withCredentials: true,
    ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
  };
}

interface Address {
  id: string;
  nama_penerima: string;
  no_hp: string;
  address: string; // detail jalan
  note?: string;
  province_name?: string;
  city_name?: string;
  district_name?: string;
  subdistrict_name?: string;
  zip_code?: string;
  subdistrict_id?: string;
}

interface Region {
  id: number;
  name: string;
}

export default function AddressTab() {
  const { toasts, addToast, removeToast } = useToast();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; nama: string } | null>(null);

  // Form fields
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formAddressDetail, setFormAddressDetail] = useState("");
  const [formPostalCode, setFormPostalCode] = useState("");
  const [formNote, setFormNote] = useState("");

  // Regional state
  const [formProvinceId, setFormProvinceId] = useState("");
  const [formProvinceName, setFormProvinceName] = useState("");
  const [formCityId, setFormCityId] = useState("");
  const [formCityName, setFormCityName] = useState("");
  const [formDistrictId, setFormDistrictId] = useState("");
  const [formDistrictName, setFormDistrictName] = useState("");
  const [formSubdistrictId, setFormSubdistrictId] = useState("");
  const [formSubdistrictName, setFormSubdistrictName] = useState("");

  const [provinces, setProvinces] = useState<Region[]>([]);
  const [cities, setCities] = useState<Region[]>([]);
  const [districts, setDistricts] = useState<Region[]>([]);
  const [subdistricts, setSubdistricts] = useState<Region[]>([]);

  // Pending refs for edit mode cascade loading
  const pendingCityName = useRef("");
  const pendingDistrictName = useRef("");
  const pendingSubdistrictName = useRef("");

  const [isLoadingRegions, setIsLoadingRegions] = useState({
    provinces: false,
    cities: false,
    districts: false,
    subdistricts: false,
  });

  // ─── Fetch addresses ─────────────────────────────────────
  const fetchAddresses = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/user/address`, authConfig());
      const data: any[] = res.data?.data ?? res.data ?? [];
      const mapped: Address[] = data.map((a: any) => ({
        id: String(a.id),
        nama_penerima: a.nama_penerima || a.name || "",
        no_hp: a.no_hp || a.phone || "",
        address: a.address || "",
        note: a.note || "",
        province_name: a.province_name || "",
        city_name: a.city_name || "",
        district_name: a.district_name || "",
        subdistrict_name: a.subdistrict_name || "",
        zip_code: a.zip_code || "",
        subdistrict_id: a.subdistrict_id || "",
      }));
      setAddresses(mapped);
    } catch (err: any) {
      if (err?.response?.status !== 404) {
        console.warn("Gagal memuat alamat:", err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAddresses(); }, []);

  // ─── Regional API: Provinces ──────────────────────────────
  useEffect(() => {
    const fetchProvinces = async () => {
      setIsLoadingRegions((p) => ({ ...p, provinces: true }));
      try {
        const res = await axios.get("/regional-api/provinces");
        setProvinces(res.data?.data || []);
      } catch { /* silent */ }
      finally { setIsLoadingRegions((p) => ({ ...p, provinces: false })); }
    };
    fetchProvinces();
  }, []);

  // ─── Regional API: Cities ─────────────────────────────────
  useEffect(() => {
    if (!formProvinceId) { setCities([]); return; }
    const fetchCities = async () => {
      setIsLoadingRegions((p) => ({ ...p, cities: true }));
      try {
        const res = await axios.get(`/regional-api/cities/${formProvinceId}`);
        const cityList: Region[] = res.data?.data || [];
        setCities(cityList);
        if (pendingCityName.current) {
          const cityId = findRegionId(cityList, pendingCityName.current);
          if (cityId) { setFormCityId(cityId); setFormCityName(pendingCityName.current); }
          pendingCityName.current = "";
        }
      } catch { /* silent */ }
      finally { setIsLoadingRegions((p) => ({ ...p, cities: false })); }
    };
    fetchCities();
  }, [formProvinceId]);

  // ─── Regional API: Districts ──────────────────────────────
  useEffect(() => {
    if (!formCityId) { setDistricts([]); return; }
    const fetchDistricts = async () => {
      setIsLoadingRegions((p) => ({ ...p, districts: true }));
      try {
        const res = await axios.get(`/regional-api/districts/${formCityId}`);
        const distList: Region[] = res.data?.data || [];
        setDistricts(distList);
        if (pendingDistrictName.current) {
          const distId = findRegionId(distList, pendingDistrictName.current);
          if (distId) { setFormDistrictId(distId); setFormDistrictName(pendingDistrictName.current); }
          pendingDistrictName.current = "";
        }
      } catch { /* silent */ }
      finally { setIsLoadingRegions((p) => ({ ...p, districts: false })); }
    };
    fetchDistricts();
  }, [formCityId]);

  // ─── Regional API: Subdistricts ───────────────────────────
  useEffect(() => {
    if (!formDistrictId) { setSubdistricts([]); return; }
    const fetchSubdistricts = async () => {
      setIsLoadingRegions((p) => ({ ...p, subdistricts: true }));
      try {
        const res = await axios.get(`/regional-api/villages/${formDistrictId}`);
        const subList: Region[] = res.data?.data || [];
        setSubdistricts(subList);
        if (pendingSubdistrictName.current) {
          const subId = findRegionId(subList, pendingSubdistrictName.current);
          if (subId) { setFormSubdistrictId(subId); setFormSubdistrictName(pendingSubdistrictName.current); }
          pendingSubdistrictName.current = "";
        }
      } catch { /* silent */ }
      finally { setIsLoadingRegions((p) => ({ ...p, subdistricts: false })); }
    };
    fetchSubdistricts();
  }, [formDistrictId]);

  // ─── Helpers ──────────────────────────────────────────────

  const findRegionId = (list: Region[], name: string): string => {
    if (!name.trim()) return "";
    const lower = name.toLowerCase().trim();
    const found = list.find((r) => r.name.toLowerCase() === lower || r.name.toLowerCase().includes(lower));
    return found ? String(found.id) : "";
  };

  const resetForm = () => {
    setFormName(""); setFormPhone("");
    setFormAddressDetail(""); setFormPostalCode(""); setFormNote("");
    setFormProvinceId(""); setFormProvinceName("");
    setFormCityId(""); setFormCityName("");
    setFormDistrictId(""); setFormDistrictName("");
    setFormSubdistrictId(""); setFormSubdistrictName("");
    setCities([]); setDistricts([]); setSubdistricts([]);
    setEditingId(null);
  };

  const openAddForm = () => { resetForm(); setShowForm(true); };

  const openEditForm = (addr: Address) => {
    setFormName(addr.nama_penerima);
    setFormPhone(addr.no_hp);
    setFormAddressDetail(addr.address);
    setFormPostalCode(addr.zip_code || "");
    setFormNote(addr.note || "");
    setEditingId(addr.id);
    setShowForm(true);

    // Restore regional dropdowns from saved names
    if (addr.province_name) {
      const provId = findRegionId(provinces, addr.province_name);
      if (provId) {
        setFormProvinceId(provId);
        setFormProvinceName(addr.province_name);
        pendingCityName.current = addr.city_name || "";
        pendingDistrictName.current = addr.district_name || "";
        pendingSubdistrictName.current = addr.subdistrict_name || "";
      } else {
        setFormProvinceName(addr.province_name);
      }
    }
  };

  /** Build display string for the address card */
  const buildDisplayAddress = (addr: Address) => {
    const parts = [addr.address];
    if (addr.subdistrict_name) parts.push(`Kel. ${addr.subdistrict_name}`);
    if (addr.district_name) parts.push(`Kec. ${addr.district_name}`);
    if (addr.city_name) parts.push(addr.city_name);
    if (addr.province_name) parts.push(`Prov. ${addr.province_name}`);
    if (addr.zip_code) parts.push(addr.zip_code);
    return parts.filter(Boolean).join(", ");
  };

  // ─── Save ─────────────────────────────────────────────────
  const handleSaveAddress = async () => {
    if (!formName || !formPhone || !formAddressDetail) {
      addToast("Nama penerima, no. HP, dan alamat wajib diisi", "error");
      return;
    }
    if (!editingId && (!formProvinceId || !formCityId || !formDistrictId) && !formSubdistrictId) {
      addToast("Pilih Provinsi, Kota, dan Kecamatan, atau gunakan pencarian tujuan", "error");
      return;
    }

    setSaving(true);
    const payload = {
      nama_penerima: formName,
      no_hp: formPhone,
      address: formAddressDetail,
      note: formNote || undefined,
      province_name: formProvinceName || undefined,
      city_name: formCityName || undefined,
      district_name: formDistrictName || undefined,
      subdistrict_name: formSubdistrictName || undefined,
      zip_code: formPostalCode || undefined,
      subdistrict_id: formSubdistrictId || undefined,
    };

    try {
      if (editingId) {
        await axios.patch(`${API_BASE}/api/user/address/${editingId}`, payload, authConfig());
        addToast("Alamat berhasil diperbarui", "success");
      } else {
        await axios.post(`${API_BASE}/api/user/address`, payload, authConfig());
        addToast("Alamat berhasil ditambahkan", "success");
      }
      setShowForm(false);
      resetForm();
      await fetchAddresses(); // re-fetch to get clean data from backend
    } catch (err: any) {
      addToast(err.response?.data?.message || err.message || "Gagal menyimpan alamat", "error");
    } finally {
      setSaving(false);
    }
  };

  // ─── Delete ───────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    setSaving(true);
    try {
      await axios.delete(`${API_BASE}/api/user/address/${id}`, authConfig());
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      addToast("Alamat berhasil dihapus", "success");
    } catch (err: any) {
      addToast(err.response?.data?.message || err.message || "Gagal menghapus alamat", "error");
    } finally {
      setSaving(false);
      setDeleteTarget(null);
    }
  };

  // ─── Loading State ────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6">
        <div><h2 className="font-headline text-[24px] font-semibold text-on-surface">Alamat Saya</h2><p className="text-[13px] text-on-surface-variant mt-1">Memuat data alamat...</p></div>
        <div className="bg-white rounded-2xl border border-outline-variant/30 shadow-soft p-7 space-y-4 animate-pulse">
          {[1, 2].map((i) => (<div key={i} className="h-24 bg-surface-container rounded-xl" />))}
        </div>
      </div>
    );
  }

  // ─── Render ───────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className="flex items-center justify-between">
        <div><h2 className="font-headline text-[24px] font-semibold text-on-surface">Alamat Saya</h2><p className="text-[13px] text-on-surface-variant mt-1">Kelola alamat pengiriman kamu</p></div>
        <button onClick={openAddForm} className="bg-primary text-white px-5 py-2.5 rounded-xl text-[13px] font-semibold shadow-soft hover:shadow-float active:scale-[0.98] transition-all flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">add</span> Tambah Alamat
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-outline-variant/30 shadow-soft p-7 animate-[fadeIn_0.3s_ease]">
          <h3 className="text-[16px] font-semibold text-on-surface mb-5">{editingId ? "Edit Alamat" : "Tambah Alamat Baru"}</h3>

          {/* Row: Nama Penerima & No HP */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-on-surface-variant">Nama Penerima <span className="text-error">*</span></label>
              <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Nama lengkap" className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[13px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" required />
            </div>
            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-on-surface-variant">No. Telepon <span className="text-error">*</span></label>
              <input type="tel" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} placeholder="08xxxxxxxxxx" className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[13px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" required />
            </div>
          </div>

          {/* Row: Provinsi & Kota */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-on-surface-variant flex justify-between">Provinsi <span className="text-error">*</span>{isLoadingRegions.provinces && <span className="text-[10px] text-primary animate-pulse">Memuat...</span>}</label>
              <select
                value={formProvinceId}
                onChange={(e) => {
                  const id = e.target.value;
                  setFormProvinceId(id);
                  const prov = provinces.find((p) => p.id.toString() === id);
                  setFormProvinceName(prov ? prov.name : "");
                  setFormCityId(""); setFormCityName("");
                  setFormDistrictId(""); setFormDistrictName("");
                  setFormSubdistrictId(""); setFormSubdistrictName("");
                }}
                disabled={isLoadingRegions.provinces}
                className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[13px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
              >
                <option value="">Pilih Provinsi</option>
                {provinces.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-on-surface-variant flex justify-between">Kota / Kabupaten <span className="text-error">*</span>{isLoadingRegions.cities && <span className="text-[10px] text-primary animate-pulse">Memuat...</span>}</label>
              <select
                value={formCityId}
                onChange={(e) => {
                  const id = e.target.value;
                  setFormCityId(id);
                  const city = cities.find((c) => c.id.toString() === id);
                  setFormCityName(city ? city.name : "");
                  setFormDistrictId(""); setFormDistrictName("");
                  setFormSubdistrictId(""); setFormSubdistrictName("");
                }}
                disabled={!formProvinceId || isLoadingRegions.cities}
                className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[13px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
              >
                <option value="">Pilih Kota/Kabupaten</option>
                {cities.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
              </select>
            </div>
          </div>

          {/* Row: Kecamatan & Kelurahan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-on-surface-variant flex justify-between">Kecamatan <span className="text-error">*</span>{isLoadingRegions.districts && <span className="text-[10px] text-primary animate-pulse">Memuat...</span>}</label>
              <select
                value={formDistrictId}
                onChange={(e) => {
                  const id = e.target.value;
                  setFormDistrictId(id);
                  const dist = districts.find((d) => d.id.toString() === id);
                  setFormDistrictName(dist ? dist.name : "");
                  setFormSubdistrictId(""); setFormSubdistrictName("");
                }}
                disabled={!formCityId || isLoadingRegions.districts}
                className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[13px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
              >
                <option value="">Pilih Kecamatan</option>
                {districts.map((d) => (<option key={d.id} value={d.id}>{d.name}</option>))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-on-surface-variant flex justify-between">Kelurahan{isLoadingRegions.subdistricts && <span className="text-[10px] text-primary animate-pulse">Memuat...</span>}</label>
              <select
                value={formSubdistrictId}
                onChange={(e) => {
                  const id = e.target.value;
                  setFormSubdistrictId(id);
                  const sub = subdistricts.find((s) => s.id.toString() === id);
                  setFormSubdistrictName(sub ? sub.name : "");
                }}
                disabled={!formDistrictId || isLoadingRegions.subdistricts}
                className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[13px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
              >
                <option value="">Pilih Kelurahan</option>
                {subdistricts.map((s) => (<option key={s.id} value={s.id}>{s.name}</option>))}
              </select>
            </div>
          </div>

          {/* Row: Kode Pos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-on-surface-variant">Kode Pos</label>
              <input type="text" value={formPostalCode} onChange={(e) => setFormPostalCode(e.target.value)} placeholder="12345" maxLength={5} className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[13px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
            </div>
          </div>

          {/* Alamat Detail */}
          <div className="mb-4">
            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-on-surface-variant">Alamat Lengkap (Jalan, RT/RW, Patokan) <span className="text-error">*</span></label>
              <textarea value={formAddressDetail} onChange={(e) => setFormAddressDetail(e.target.value)} placeholder="Nama jalan, nomor rumah, RT/RW, patokan" rows={2} className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[13px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none" required />
            </div>
          </div>

          {/* Catatan */}
          <div className="mb-5">
            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-on-surface-variant">Catatan</label>
              <textarea value={formNote} onChange={(e) => setFormNote(e.target.value)} placeholder="contoh: Warna pagar hijau, rumah pojok" rows={2} className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[13px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none" />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button onClick={handleSaveAddress} disabled={saving} className="bg-primary text-white px-6 py-3 rounded-xl text-[13px] font-semibold shadow-soft hover:shadow-float active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-2">
              {saving ? (<><span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span> Menyimpan...</>) : (editingId ? "Simpan Perubahan" : "Tambah Alamat")}
            </button>
            <button onClick={() => { setShowForm(false); resetForm(); }} disabled={saving} className="px-6 py-3 border border-outline-variant/40 rounded-xl text-[13px] font-semibold text-on-surface-variant hover:bg-surface-container transition-all disabled:opacity-50">
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Address Cards */}
      <div className="space-y-4">
        {addresses.map((addr) => (
          <div key={addr.id} className="bg-white rounded-2xl border-2 border-outline-variant/20 p-6 shadow-soft transition-all">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[14px] font-semibold text-on-surface">{addr.nama_penerima}</span>
                  <span className="text-[11px] text-on-surface-variant">|</span>
                  <span className="text-[13px] text-on-surface-variant">{addr.no_hp}</span>
                </div>
                <p className="text-[13px] text-on-surface-variant leading-5 mb-2">{buildDisplayAddress(addr)}</p>
                {addr.note && (<p className="text-[12px] text-on-surface-variant/70 mb-2 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">sticky_note_2</span>{addr.note}</p>)}
              </div>
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <div className="flex gap-2">
                  <button onClick={() => openEditForm(addr)} className="text-[12px] text-primary font-semibold hover:underline">Ubah</button>
                  <span className="text-outline-variant">|</span>
                  <button onClick={() => setDeleteTarget({ id: addr.id, nama: addr.nama_penerima })} className="text-[12px] text-error font-semibold hover:underline">Hapus</button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {addresses.length === 0 && (
          <div className="bg-white rounded-2xl border border-outline-variant/30 p-12 text-center">
            <span className="material-symbols-outlined text-[48px] text-outline-variant mb-4 block">location_off</span>
            <p className="text-[14px] text-on-surface-variant mb-4">Belum ada alamat tersimpan</p>
            <button onClick={openAddForm} className="text-[13px] text-primary font-semibold hover:underline">+ Tambah Alamat Pertama</button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteTarget !== null}
        title="Hapus Alamat"
        itemName={deleteTarget?.nama ?? ""}
        description="Alamat"
        isDeleting={saving}
        onConfirm={() => {
          if (deleteTarget) handleDelete(deleteTarget.id);
        }}
        onCancel={() => setDeleteTarget(null)}
        confirmLabel="Hapus"
        confirmingLabel="Menghapus..."
        error={null}
      />
    </div>
  );
}
