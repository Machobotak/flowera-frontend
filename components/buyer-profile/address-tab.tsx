"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import ToastContainer from "@/components/toast-container";
import DeleteConfirmModal from "@/components/seller-product/delete-confirm-modal";

interface Address {
  id: string;
  label: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  isDefault: boolean;
  note?: string;
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
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null);

  // Form fields
  const [formLabel, setFormLabel] = useState("");
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

  const [provinces, setProvinces] = useState<Region[]>([]);
  const [cities, setCities] = useState<Region[]>([]);
  const [districts, setDistricts] = useState<Region[]>([]);
  const pendingCityName = useRef("");
  const pendingDistrictName = useRef("");
  const [isLoadingRegions, setIsLoadingRegions] = useState({
    provinces: false,
    cities: false,
    districts: false,
  });

  // Fetch addresses
  const fetchAddresses = async () => {
    try {
      const res = await axios.get("/api/user/address", { withCredentials: true });
      const data: any[] = res.data?.data ?? res.data ?? [];
      const mapped: Address[] = data.map((a: any) => ({
        id: String(a.id),
        label: a.label || a.nama_penerima || a.name || "Alamat",
        name: a.nama_penerima || a.name || a.recipient_name || "",
        phone: a.no_hp || a.phone || "",
        address: a.address || a.street || "",
        city: a.city || "",
        postalCode: a.postalCode || a.postal_code || "",
        isDefault: a.isDefault || a.is_default || false,
        note: a.note || "",
      }));
      setAddresses(mapped);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAddresses(); }, []);

  // Regional API: Provinces
  useEffect(() => {
    const fetchProvinces = async () => {
      setIsLoadingRegions((p) => ({ ...p, provinces: true }));
      try {
        const res = await fetch("/regional-api/provinces");
        const json = await res.json();
        setProvinces(json.data || []);
      } catch { /* silent */ }
      finally { setIsLoadingRegions((p) => ({ ...p, provinces: false })); }
    };
    if (provinces.length === 0) fetchProvinces();
  }, [provinces.length]);

  // Regional API: Cities
  useEffect(() => {
    if (!formProvinceId) { setCities([]); return; }
    const fetchCities = async () => {
      setIsLoadingRegions((p) => ({ ...p, cities: true }));
      try {
        const res = await fetch(`/regional-api/cities/${formProvinceId}`);
        const json = await res.json();
        const cityList: Region[] = json.data || [];
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

  // Regional API: Districts
  useEffect(() => {
    if (!formCityId) { setDistricts([]); return; }
    const fetchDistricts = async () => {
      setIsLoadingRegions((p) => ({ ...p, districts: true }));
      try {
        const res = await fetch(`/regional-api/districts/${formCityId}`);
        const json = await res.json();
        const distList: Region[] = json.data || [];
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

  const resetRegionalForm = () => {
    setFormProvinceId(""); setFormProvinceName("");
    setFormCityId(""); setFormCityName("");
    setFormDistrictId(""); setFormDistrictName("");
    setCities([]); setDistricts([]);
  };

  const resetForm = () => {
    setFormLabel(""); setFormName(""); setFormPhone("");
    setFormAddressDetail(""); setFormPostalCode(""); setFormNote("");
    resetRegionalForm(); setEditingId(null);
  };

  const openAddForm = () => { resetForm(); setShowForm(true); };

  const parseAddress = (fullAddress: string) => {
    const parts = fullAddress.split(", ").map((s) => s.trim());
    const result: { detail: string; district: string; city: string; province: string; postal: string } = {
      detail: "", district: "", city: "", province: "", postal: "",
    };
    const kecIdx = parts.findIndex((p) => p.startsWith("Kec. "));
    const provIdx = parts.findIndex((p) => p.startsWith("Prov. "));
    if (kecIdx >= 0) result.district = parts[kecIdx].replace("Kec. ", "");
    if (provIdx >= 0) result.province = parts[provIdx].replace("Prov. ", "");
    if (kecIdx >= 0 && provIdx > kecIdx) {
      result.city = parts.slice(kecIdx + 1, provIdx).join(", ");
    } else if (provIdx >= 0 && kecIdx < 0) {
      result.city = parts.slice(provIdx - 1, provIdx).join(", ");
    }
    const last = parts[parts.length - 1];
    if (/^\d{5}$/.test(last)) result.postal = last;
    if (kecIdx > 0) {
      result.detail = parts.slice(0, kecIdx).join(", ");
    } else if (provIdx > 0) {
      result.detail = parts.slice(0, provIdx - 1).filter(p => !/^\d{5}$/.test(p)).join(", ");
    } else {
      result.detail = parts.filter(p => !/^\d{5}$/.test(p)).join(", ");
    }
    return result;
  };

  const findRegionId = (list: Region[], name: string): string => {
    if (!name.trim()) return "";
    const lower = name.toLowerCase().trim();
    const found = list.find((r) => r.name.toLowerCase() === lower || r.name.toLowerCase().includes(lower));
    return found ? String(found.id) : "";
  };

  const openEditForm = (addr: Address) => {
    setFormLabel(addr.label); setFormName(addr.name); setFormPhone(addr.phone);
    setFormNote(addr.note || ""); setEditingId(addr.id); setShowForm(true);
    const parsed = parseAddress(addr.address);
    setFormAddressDetail(parsed.detail || addr.address);
    setFormPostalCode(parsed.postal || addr.postalCode);
    if (parsed.province) {
      const provId = findRegionId(provinces, parsed.province);
      if (provId) {
        setFormProvinceId(provId); setFormProvinceName(parsed.province);
        pendingCityName.current = parsed.city; pendingDistrictName.current = parsed.district;
      } else {
        setFormProvinceId(""); setFormProvinceName("");
        setFormCityId(""); setFormCityName("");
        setFormDistrictId(""); setFormDistrictName("");
      }
    } else {
      setFormProvinceId(""); setFormProvinceName("");
      setFormCityId(""); setFormCityName("");
      setFormDistrictId(""); setFormDistrictName("");
    }
  };

  const buildFullAddress = () => {
    const parts = [formAddressDetail];
    if (formDistrictName) parts.push(`Kec. ${formDistrictName}`);
    if (formCityName) parts.push(formCityName);
    if (formProvinceName) parts.push(`Prov. ${formProvinceName}`);
    if (formPostalCode) parts.push(formPostalCode);
    return parts.filter(Boolean).join(", ");
  };

  const handleSaveAddress = async () => {
    if (!formName || !formPhone || !formAddressDetail) return;
    let fullAddress = formAddressDetail;
    if (formProvinceId && formCityId && formDistrictId) {
      fullAddress = buildFullAddress();
    } else if (!editingId) {
      addToast("Pilih Provinsi, Kota, dan Kecamatan terlebih dahulu", "error");
      return;
    }
    setSaving(true);
    const payload = { nama_penerima: formName, no_hp: formPhone, address: fullAddress, note: formNote || "" };
    try {
      if (editingId) {
        await axios.patch(`/api/user/address/${editingId}`, payload, { withCredentials: true });
        setAddresses((prev) => prev.map((a) => a.id === editingId ? { ...a, name: formName, phone: formPhone, address: fullAddress, label: formLabel || "Alamat", note: formNote } : a));
        addToast("Alamat berhasil diperbarui", "success");
      } else {
        const res = await axios.post("/api/user/address", payload, { withCredentials: true });
        const newId = res.data?.data?.id || res.data?.id || Date.now().toString();
        setAddresses((prev) => [...prev, { id: String(newId), label: formLabel || "Alamat", name: formName, phone: formPhone, address: fullAddress, city: formCityName, postalCode: formPostalCode, isDefault: addresses.length === 0 }]);
        addToast("Alamat berhasil ditambahkan", "success");
      }
      setShowForm(false); resetForm();
    } catch (err: any) {
      addToast(err.response?.data?.message || err.message || "Gagal menyimpan alamat", "error");
    } finally { setSaving(false); }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await axios.patch(`/api/user/address/${id}`, { is_default: true }, { withCredentials: true });
      setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
    } catch (err: any) {
      addToast(err.response?.data?.message || err.message || "Gagal mengatur alamat utama", "error");
    }
  };

  const handleDelete = async (id: string) => {
    setSaving(true);
    try {
      await axios.delete(`/api/user/address/${id}`, { withCredentials: true });
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      addToast("Alamat berhasil dihapus", "success");
    } catch (err: any) {
      addToast(err.response?.data?.message || err.message || "Gagal menghapus alamat", "error");
    } finally {
      setSaving(false);
      setDeleteTarget(null);
    }
  };

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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-on-surface-variant">Label Alamat</label>
              <input type="text" value={formLabel} onChange={(e) => setFormLabel(e.target.value)} placeholder="contoh: Rumah, Kantor" className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[13px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-on-surface-variant">Nama Penerima <span className="text-error">*</span></label>
              <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Nama lengkap" className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[13px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" required />
            </div>
          </div>

          <div className="mb-4">
            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-on-surface-variant">No. Telepon <span className="text-error">*</span></label>
              <input type="tel" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} placeholder="08xxxxxxxxxx" className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[13px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" required />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-on-surface-variant flex justify-between">Provinsi <span className="text-error">*</span>{isLoadingRegions.provinces && <span className="text-[10px] text-primary animate-pulse">Memuat...</span>}</label>
              <select value={formProvinceId} onChange={(e) => { const id = e.target.value; setFormProvinceId(id); const prov = provinces.find((p) => p.id.toString() === id); setFormProvinceName(prov ? prov.name : ""); setFormCityId(""); setFormCityName(""); setFormDistrictId(""); setFormDistrictName(""); }} disabled={isLoadingRegions.provinces} className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[13px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none">
                <option value="">Pilih Provinsi</option>
                {provinces.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-on-surface-variant flex justify-between">Kota / Kabupaten <span className="text-error">*</span>{isLoadingRegions.cities && <span className="text-[10px] text-primary animate-pulse">Memuat...</span>}</label>
              <select value={formCityId} onChange={(e) => { const id = e.target.value; setFormCityId(id); const city = cities.find((c) => c.id.toString() === id); setFormCityName(city ? city.name : ""); setFormDistrictId(""); setFormDistrictName(""); }} disabled={!formProvinceId || isLoadingRegions.cities} className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[13px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none">
                <option value="">Pilih Kota/Kabupaten</option>
                {cities.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-on-surface-variant flex justify-between">Kecamatan <span className="text-error">*</span>{isLoadingRegions.districts && <span className="text-[10px] text-primary animate-pulse">Memuat...</span>}</label>
              <select value={formDistrictId} onChange={(e) => { const id = e.target.value; setFormDistrictId(id); const dist = districts.find((d) => d.id.toString() === id); setFormDistrictName(dist ? dist.name : ""); }} disabled={!formCityId || isLoadingRegions.districts} className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[13px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none">
                <option value="">Pilih Kecamatan</option>
                {districts.map((d) => (<option key={d.id} value={d.id}>{d.name}</option>))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-on-surface-variant">Kode Pos</label>
              <input type="text" value={formPostalCode} onChange={(e) => setFormPostalCode(e.target.value)} placeholder="12345" maxLength={5} className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[13px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
            </div>
          </div>

          <div className="mb-4">
            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-on-surface-variant">Alamat Lengkap <span className="text-error">*</span></label>
              <textarea value={formAddressDetail} onChange={(e) => setFormAddressDetail(e.target.value)} placeholder="Nama jalan, nomor rumah, RT/RW, patokan" rows={2} className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[13px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none" required />
            </div>
          </div>

          <div className="mb-5">
            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-on-surface-variant">Catatan</label>
              <textarea value={formNote} onChange={(e) => setFormNote(e.target.value)} placeholder="contoh: Warna pagar hijau, rumah pojok" rows={2} className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[13px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none" />
            </div>
          </div>

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

      <div className="space-y-4">
        {addresses.map((addr) => (
          <div key={addr.id} className={`bg-white rounded-2xl border-2 p-6 shadow-soft transition-all ${addr.isDefault ? "border-primary/30" : "border-outline-variant/20"}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[14px] font-semibold text-on-surface">{addr.name}</span>
                  <span className="text-[11px] text-on-surface-variant">|</span>
                  <span className="text-[13px] text-on-surface-variant">{addr.phone}</span>
                </div>
                <p className="text-[13px] text-on-surface-variant leading-5 mb-2">{addr.address}</p>
                {addr.note && (<p className="text-[12px] text-on-surface-variant/70 mb-2 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">sticky_note_2</span>{addr.note}</p>)}
                <div className="flex items-center gap-3 mt-3">
                  {addr.isDefault && (<span className="text-[11px] font-bold text-primary border border-primary px-2.5 py-0.5 rounded">Utama</span>)}
                  <span className="bg-surface-container text-on-surface-variant px-2.5 py-0.5 rounded text-[11px] font-medium">{addr.label}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <div className="flex gap-2">
                  <button onClick={() => openEditForm(addr)} className="text-[12px] text-primary font-semibold hover:underline">Ubah</button>
                  {!addr.isDefault && (<><span className="text-outline-variant">|</span><button onClick={() => setDeleteTarget({ id: addr.id, label: addr.label })} className="text-[12px] text-error font-semibold hover:underline">Hapus</button></>)}
                </div>
                {!addr.isDefault && (<button onClick={() => handleSetDefault(addr.id)} className="text-[12px] text-on-surface-variant border border-outline-variant/40 px-3 py-1.5 rounded-lg hover:bg-surface-container transition-all">Atur sebagai Utama</button>)}
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
        itemName={deleteTarget?.label ?? ""}
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
