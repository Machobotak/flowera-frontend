"use client";

import React, { useState, useCallback, useMemo } from "react";

/* ──────────────────────────── Types ──────────────────────────── */

interface CartAddon {
  name: string;
  qty?: number;
  price: number;
  icon: string;
  image?: string;
}

interface CartItem {
  id: string;
  name: string;
  florist: string;
  price: number;
  qty: number;
  image: string;
  flowerType?: string;
  wrappingColor?: string;
  wrappingLabel?: string;
  addons?: CartAddon[];
  note?: string;
}

/* ──────────────────────────── Data ──────────────────────────── */

const INITIAL_CART: CartItem[] = [
  {
    id: "1",
    name: "Midnight Grace",
    florist: "The Velvet Rose Florist",
    price: 450000,
    qty: 1,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB2gUwgvHVeY6k-Mj9af0voVS5A7taBgEpmlkFTl1zVrhEOYtXz_p2qiRwDkkPYfepg8PZFoARMelNrheS_Sfbk7gimiQT8hYb7mvqWroNJsZWJfRXzN70p5V1vSnIljQcRwcPvUMZoxPB4KpASwBXWz6Z2zi_jo4jghhbkeD6Wq56PRXeXB3QyWkn8VdlTpjSKyJzdX3UfhpWT_yr54S666YNUHSjPPHFKHehPl0B0oX3KWA-UD3jX489q-4DErQXTgD4RjbM-wB0",
    flowerType: "Roses",
    wrappingColor: "#8c4a5c",
    wrappingLabel: "Rose Pink",
    addons: [
      { name: "Teddy Bear", qty: 1, price: 15000, icon: "toys" },
      { name: "LED Lights", price: 8000, icon: "lightbulb" },
    ],
  },
  {
    id: "2",
    name: "Cloud Nine",
    florist: "Petals & Prose",
    price: 875000,
    qty: 1,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCaJaUCsxPovSgEVg_IdPJk-U3TF8jaudB-5nlaZznoYzz4VmlQCskaxsAIYHnqrhYGWzxCzpuJE-6n1HcT6M0CRrvTsANPkRA2lWwBdiy9feZMPcEYag94uNgVSOf6hMwUTGZQYVpJRUNwZAWf2sESnxOxte3GQRFuqDQwx1vD6Pger7utJIs3F5bztz1MjpKm-ipetcZbfj2VS4Lz7Pfnhy8AqbQbm3lBSQeITorIfIi8Yy0xXkvQXfX9K_DpHOxuhssTd57J4ZQ",
    flowerType: "Tulips",
    wrappingColor: "#3a6847",
    wrappingLabel: "Forest Green",
    addons: [
      { name: "Balloons", qty: 2, price: 5000, icon: "circle" },
      { name: "Greeting Card", price: 5000, icon: "mail" },
      { name: "Teddy Bear", qty: 1, price: 15000, icon: "toys" },
    ],
    note: "Kirim sore jam 3, tolong taruh di depan pintu ya",
  },
];

const RECOMMENDED = [
  {
    id: "r1",
    name: "Golden Hour",
    florist: "Sunlit Blooms",
    price: 320000,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuALi3jtLys9GQK4zuPNTLeK5fH-p66mY-cHWAwD4bB86HAtWgVdzDsyjW0ILgI6Rl7fwyDwrXxOE5IkIo6NArfueTT8wzW5iZnUQYKUNqibjc3HH3X4mmsTmQLolHRVY_SVDTN6wSCyWscb_Akr9nuBg6CWJA1nqSAU0a7-WgNmmWMgJxd_LVZBsV2OEM1uB_ZHItrtYyIHzZ9eZBHmYaDUsC9Ml09B3EDEjzl0zNHW1jrY2nyPKjI-ByOqzX1zcjT5BLmQ86srKGs",
    rating: "4.8",
  },
  {
    id: "r2",
    name: "Seraphic Dream",
    florist: "Graceful Petals",
    price: 595000,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCq13s2kk1SI9h5iqcW6u_RJ7SPPBwAeyeCFkiAhvBgizv7pk0eGhQiqQ6i5ywdNa_It_aL4IMl0WZ9DvJ5hhFQx4HU3UQq6e2EIlfuTr6nVZ2l_VSECrQzQMdQkLbnNiSsfIiM5ToHikLAoxBnRn6RGa7TatYpmKZIttIt4ZqwprXn4KcC9FccEPsYgNmkBpgpH44sh9Y0PeF2qhBgvKIEIcvjbreH8uCpgSoVVLcLwh7tHiCx7xPG2Cnedgo2CkuWEYMABmzVVqA",
    rating: "4.9",
  },
  {
    id: "r3",
    name: "Scarlet Symphony",
    florist: "The Florist Lab",
    price: 1250000,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA589J2dyw5lGSPJJrZkF-l66EVd7eGPOvzDqOUwAttv__mRVYah9AsGCFeC5rcK_77ZKJwKAHJsZ_8sshU0_2P3Wdl7oJb8Ro1eaKSYwWah2apqE7nDQ82F2a4ORmOotRVA47cKOx4A-btzcOpkm9Dwz8Ug5BCynxO9KXjGIvQexBEL42vdqC1vAtQSbTEZoSYhLGwAV_bJF0GHSGmgivfY5VH3je6Oypnhxw-58CjSywx_08kC_dtt_jUSQ0TcAb9OEm4ErknIKo",
    rating: "5.0",
  },
];

/* ──────────────────────────── Helpers ──────────────────────────── */

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

const FILL_STYLE = { fontVariationSettings: "'FILL' 1" } as const;

/* ──────────────────────────── Sub‑components ──────────────────────────── */

function CartItemCard({
  item,
  selected,
  onToggleSelect,
  onQtyChange,
  onRemove,
}: {
  item: CartItem;
  selected: boolean;
  onToggleSelect: (id: string) => void;
  onQtyChange: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className={`flex gap-5 p-5 bg-white rounded-xl border-2 shadow-soft group hover:shadow-float transition-all duration-300 ${
      selected ? "border-primary/40" : "border-outline-variant/20 opacity-60"
    }`}>
      {/* Checkbox */}
      <div className="flex items-center pt-1 flex-shrink-0">
        <label className="relative flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onToggleSelect(item.id)}
            className="peer sr-only"
          />
          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
            selected
              ? "bg-primary border-primary"
              : "border-outline-variant hover:border-primary/50"
          }`}>
            {selected && (
              <span className="material-symbols-outlined text-white text-[16px]" style={FILL_STYLE}>
                check
              </span>
            )}
          </div>
        </label>
      </div>
      {/* Image */}
      <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-lg overflow-hidden flex-shrink-0">
        <img
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          src={item.image}
        />
      </div>

      {/* Details */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-headline text-[18px] leading-6 font-semibold text-on-surface truncate">
                {item.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-1">
                <span
                  className="material-symbols-outlined text-secondary text-[14px]"
                  style={FILL_STYLE}
                >
                  verified
                </span>
                <span className="text-[12px] text-on-surface-variant font-medium">
                  {item.florist}
                </span>
              </div>
            </div>
            <button
              className="p-1.5 rounded-full text-outline hover:text-error hover:bg-error-container/30 transition-all opacity-0 group-hover:opacity-100"
              onClick={() => onRemove(item.id)}
              aria-label="Hapus item"
            >
              <span className="material-symbols-outlined text-[20px]">
                delete
              </span>
            </button>
          </div>

          {/* Variation & Add-ons */}
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {/* Flower type */}
            {item.flowerType && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-container/20 text-[11px] font-medium text-on-primary-container">
                <span className="material-symbols-outlined text-[13px]" style={FILL_STYLE}>local_florist</span>
                {item.flowerType}
              </span>
            )}

            {/* Wrapping color */}
            {item.wrappingColor && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-surface-container text-[11px] font-medium text-on-surface-variant">
                <span
                  className="w-3 h-3 rounded-full border border-outline-variant/40 flex-shrink-0"
                  style={{ backgroundColor: item.wrappingColor }}
                />
                {item.wrappingLabel || "Wrapping"}
              </span>
            )}

            {/* Add-ons */}
            {item.addons?.map((addon, i) => (
              <span
                key={`${addon.name}-${i}`}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary-container/20 text-[11px] font-medium text-on-secondary-container"
              >
                {addon.image ? (
                  <img src={addon.image} alt={addon.name} className="w-4 h-4 rounded-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-[13px]">{addon.icon}</span>
                )}
                {addon.name}
                {addon.qty && addon.qty > 1 && (
                  <span className="text-[10px] opacity-70">×{addon.qty}</span>
                )}
              </span>
            ))}
          </div>

          {/* Note */}
          {item.note && (
            <div className="mt-2 flex items-start gap-2 bg-tertiary-fixed/15 rounded-lg px-3 py-2">
              <span className="material-symbols-outlined text-tertiary text-[16px] mt-0.5">
                edit_note
              </span>
              <p className="text-[12px] text-on-surface-variant leading-4 italic">
                &ldquo;{item.note}&rdquo;
              </p>
            </div>
          )}
        </div>

        {/* Price + Qty */}
        <div className="flex items-center justify-between mt-3">
          <p className="font-bold text-primary text-[18px]">
            {formatRupiah(item.price)}
          </p>
          <div className="flex items-center gap-2">
            <button
              className="w-8 h-8 rounded-full border border-outline-variant flex items-center justify-center hover:bg-surface-container-high transition-colors text-on-surface-variant text-[18px] font-medium active:scale-90"
              onClick={() => onQtyChange(item.id, -1)}
            >
              −
            </button>
            <span className="w-6 text-center tabular-nums font-semibold text-[14px]">
              {item.qty}
            </span>
            <button
              className="w-8 h-8 rounded-full border border-outline-variant flex items-center justify-center hover:bg-surface-container-high transition-colors text-on-surface-variant text-[18px] font-medium active:scale-90"
              onClick={() => onQtyChange(item.id, 1)}
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-28 h-28 rounded-full bg-primary-container/20 flex items-center justify-center mb-6">
        <span className="material-symbols-outlined text-primary text-5xl">
          shopping_cart
        </span>
      </div>
      <h2 className="font-headline text-[24px] font-semibold text-on-surface mb-2">
        Keranjang kamu kosong
      </h2>
      <p className="text-on-surface-variant font-body text-[14px] max-w-sm mb-8">
        Belum ada bunga di keranjangmu. Yuk, jelajahi koleksi buket premium kami
        dan temukan yang spesial.
      </p>
      <a
        href="/"
        className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-xl font-body text-[14px] tracking-[0.05em] font-semibold shadow-soft hover:shadow-float hover:scale-[1.02] active:scale-[0.98] transition-all"
      >
        <span className="material-symbols-outlined text-[18px]">
          local_florist
        </span>
        Mulai Belanja
      </a>
    </div>
  );
}

function RecommendedCard({
  item,
}: {
  item: (typeof RECOMMENDED)[number];
}) {
  return (
    <div className="min-w-[200px] bg-white rounded-xl shadow-soft overflow-hidden group hover:shadow-float transition-all cursor-pointer">
      <div className="relative aspect-square overflow-hidden">
        <img
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          alt={item.name}
          src={item.image}
        />
        <button className="absolute top-2.5 right-2.5 p-1.5 bg-white/80 backdrop-blur-md rounded-full text-error opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="material-symbols-outlined text-[18px]">
            favorite
          </span>
        </button>
      </div>
      <div className="p-3 space-y-1.5">
        <h4 className="font-headline text-[14px] font-semibold text-on-surface truncate">
          {item.name}
        </h4>
        <p className="text-[11px] text-on-surface-variant">{item.florist}</p>
        <div className="flex items-center justify-between pt-1">
          <span className="font-bold text-primary text-[14px]">
            {formatRupiah(item.price)}
          </span>
          <div className="flex items-center gap-0.5">
            <span
              className="material-symbols-outlined text-[#FFB129] text-[14px]"
              style={FILL_STYLE}
            >
              star
            </span>
            <span className="text-[11px] font-medium">{item.rating}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────── Page Component ──────────────────────────── */

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>(INITIAL_CART);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(INITIAL_CART.map((item) => item.id))
  );
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<"standard" | "express">("standard");

  // Handlers
  const handleQtyChange = useCallback((id: string, delta: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, qty: Math.max(1, item.qty + delta) }
          : item
      )
    );
  }, []);

  const handleRemove = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      if (prev.size === items.length) {
        return new Set();
      }
      return new Set(items.map((item) => item.id));
    });
  }, [items]);

  const handleApplyPromo = useCallback(() => {
    if (promoCode.trim().toUpperCase() === "FLORA20") {
      setPromoApplied(true);
    }
  }, [promoCode]);

  // Derived
  const selectedItems = useMemo(
    () => items.filter((item) => selectedIds.has(item.id)),
    [items, selectedIds]
  );

  const subtotal = useMemo(
    () => selectedItems.reduce((sum, item) => sum + item.price * item.qty, 0),
    [selectedItems]
  );

  const selectedCount = selectedItems.reduce((sum, item) => sum + item.qty, 0);
  const allSelected = items.length > 0 && selectedIds.size === items.length;
  const deliveryCost = selectedCount > 0 ? (selectedDelivery === "express" ? 25000 : 15000) : 0;
  const discount = promoApplied ? Math.round(subtotal * 0.2) : 0;
  const total = subtotal + deliveryCost - discount;
  const totalItemCount = items.reduce((sum, item) => sum + item.qty, 0);

  if (items.length === 0) {
    return (
      <main className="pt-8 pb-16 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        {/* Breadcrumb */}
        <nav className="flex gap-2 text-[12px] leading-4 tracking-[0.03em] font-medium text-on-surface-variant mb-8">
          <a className="hover:text-primary transition-colors" href="/">
            Home
          </a>
          <span>/</span>
          <span className="text-on-surface">Keranjang</span>
        </nav>
        <EmptyCart />

        {/* Recommendations */}
        <section className="mt-16 space-y-6">
          <h3 className="font-headline text-[22px] font-semibold text-on-surface">
            Mungkin kamu suka
          </h3>
          <div className="flex gap-5 overflow-x-auto hide-scrollbar pb-4">
            {RECOMMENDED.map((item) => (
              <RecommendedCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="pt-8 pb-16 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
      {/* Breadcrumb */}
      <nav className="flex gap-2 text-[12px] leading-4 tracking-[0.03em] font-medium text-on-surface-variant mb-2">
        <a className="hover:text-primary transition-colors" href="/">
          Home
        </a>
        <span>/</span>
        <span className="text-on-surface">Keranjang</span>
      </nav>

      {/* Header */}
      <div className="flex items-baseline justify-between mb-8">
        <h1 className="font-headline text-[28px] leading-9 font-semibold text-on-surface">
          Keranjang Belanja
        </h1>
        <span className="text-on-surface-variant text-[14px] font-medium">
          {totalItemCount} item
        </span>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* ── Left Column: Cart Items ── */}
        <div className="col-span-12 lg:col-span-8 space-y-5">
          {/* Select All + Florist grouping header */}
          <div className="flex items-center gap-3 px-1">
            <label className="relative flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={handleSelectAll}
                className="peer sr-only"
              />
              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                allSelected
                  ? "bg-primary border-primary"
                  : "border-outline-variant hover:border-primary/50"
              }`}>
                {allSelected && (
                  <span className="material-symbols-outlined text-white text-[16px]" style={FILL_STYLE}>
                    check
                  </span>
                )}
                {!allSelected && selectedIds.size > 0 && (
                  <span className="material-symbols-outlined text-outline text-[16px]">
                    horizontal_rule
                  </span>
                )}
              </div>
            </label>
            <button
              onClick={handleSelectAll}
              className="text-[13px] font-semibold text-on-surface hover:text-primary transition-colors"
            >
              Pilih Semua ({items.length})
            </button>
            <span className="mx-2 h-4 w-px bg-outline-variant/40" />
            <span className="material-symbols-outlined text-secondary text-[18px]">
              storefront
            </span>
            <span className="text-[13px] text-on-surface-variant">
              Semua dari florist terpilih
            </span>
            <span className="text-[12px] text-on-surface-variant ml-auto">
              Estimasi tiba: Besok, 14.00
            </span>
          </div>

          {/* Items */}
          {items.map((item) => (
            <CartItemCard
              key={item.id}
              item={item}
              selected={selectedIds.has(item.id)}
              onToggleSelect={handleToggleSelect}
              onQtyChange={handleQtyChange}
              onRemove={handleRemove}
            />
          ))}

          {/* Add Note / Wishlist */}
          <div className="flex gap-3 pt-2">
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-outline-variant/50 text-on-surface-variant text-[13px] font-medium hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined text-[16px]">
                edit_note
              </span>
              Tambah Catatan
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-outline-variant/50 text-on-surface-variant text-[13px] font-medium hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined text-[16px]">
                bookmark
              </span>
              Simpan untuk Nanti
            </button>
          </div>
        </div>

        {/* ── Right Column: Order Summary ── */}
        <div className="col-span-12 lg:col-span-4">
          <div className="sticky top-24 space-y-5">
            {/* Promo Code */}
            <div className="bg-white rounded-xl border border-outline-variant/40 p-5 shadow-soft">
              <h4 className="font-body text-[13px] font-semibold text-on-surface-variant uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary text-[18px]">
                  confirmation_number
                </span>
                Kode Promo
              </h4>
              <div className="flex gap-2">
                <input
                  className="flex-1 bg-surface-container-low border border-outline-variant/30 rounded-lg px-4 py-3 text-[13px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-body"
                  placeholder="Masukkan kode promo"
                  type="text"
                  value={promoCode}
                  onChange={(e) => {
                    setPromoCode(e.target.value);
                    setPromoApplied(false);
                  }}
                />
                <button
                  className="px-5 py-3 bg-secondary text-white rounded-lg text-[13px] font-semibold hover:opacity-90 active:scale-95 transition-all disabled:opacity-40"
                  onClick={handleApplyPromo}
                  disabled={!promoCode.trim()}
                >
                  Pakai
                </button>
              </div>
              {promoApplied && (
                <div className="mt-3 flex items-center gap-2 text-secondary text-[12px] font-medium animate-[fadeIn_0.3s_ease]">
                  <span className="material-symbols-outlined text-[16px]" style={FILL_STYLE}>
                    check_circle
                  </span>
                  Diskon 20% berhasil diterapkan!
                </div>
              )}
              <p className="mt-2 text-[11px] text-on-surface-variant">
                Coba: <button className="text-primary font-semibold hover:underline" onClick={() => { setPromoCode("FLORA20"); }}>FLORA20</button> untuk diskon 20%
              </p>
            </div>

            {/* Delivery Option */}
            <div className="bg-white rounded-xl border border-outline-variant/40 p-5 shadow-soft">
              <h4 className="font-body text-[13px] font-semibold text-on-surface-variant uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">
                  local_shipping
                </span>
                Pengiriman
              </h4>
              <div className="space-y-3">
                <label
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedDelivery === "standard"
                      ? "border-primary bg-primary-container/10"
                      : "border-outline-variant/30 hover:border-primary/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="delivery"
                    checked={selectedDelivery === "standard"}
                    onChange={() => setSelectedDelivery("standard")}
                    className="text-primary focus:ring-primary"
                  />
                  <div className="flex-1">
                    <span className="text-[13px] font-semibold text-on-surface block">
                      Standard
                    </span>
                    <span className="text-[11px] text-on-surface-variant">
                      Estimasi besok, 14.00 - 17.00
                    </span>
                  </div>
                  <span className="text-[13px] font-semibold text-on-surface">
                    {formatRupiah(15000)}
                  </span>
                </label>
                <label
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedDelivery === "express"
                      ? "border-primary bg-primary-container/10"
                      : "border-outline-variant/30 hover:border-primary/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="delivery"
                    checked={selectedDelivery === "express"}
                    onChange={() => setSelectedDelivery("express")}
                    className="text-primary focus:ring-primary"
                  />
                  <div className="flex-1">
                    <span className="text-[13px] font-semibold text-on-surface block">
                      Express
                      <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-tertiary-container text-on-tertiary-container uppercase">
                        Flash
                      </span>
                    </span>
                    <span className="text-[11px] text-on-surface-variant">
                      Hari ini, 2-3 jam
                    </span>
                  </div>
                  <span className="text-[13px] font-semibold text-on-surface">
                    {formatRupiah(25000)}
                  </span>
                </label>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-white rounded-xl border border-outline-variant/40 p-5 shadow-soft">
              <h4 className="font-body text-[13px] font-semibold text-on-surface-variant uppercase tracking-wider mb-5">
                Ringkasan Pesanan
              </h4>

              <div className="space-y-3 mb-5">
                <div className="flex justify-between text-[14px]">
                  <span className="text-on-surface-variant">
                    Subtotal ({selectedCount} item dipilih)
                  </span>
                  <span className="font-medium text-on-surface">
                    {formatRupiah(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-[14px]">
                  <span className="text-on-surface-variant">Pengiriman</span>
                  <span className="font-medium text-on-surface">
                    {formatRupiah(deliveryCost)}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-[14px]">
                    <span className="text-secondary font-medium flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">
                        sell
                      </span>
                      Diskon Promo
                    </span>
                    <span className="font-medium text-secondary">
                      −{formatRupiah(discount)}
                    </span>
                  </div>
                )}

                <hr className="border-outline-variant/40" />

                <div className="flex justify-between items-center pt-1">
                  <span className="font-bold text-on-surface text-[16px]">
                    Total
                  </span>
                  <span className="text-[24px] font-bold text-primary">
                    {formatRupiah(total)}
                  </span>
                </div>
              </div>

              {/* CTA */}
              <div className="space-y-3">
                {selectedCount === 0 && (
                  <p className="text-center text-[12px] text-on-surface-variant italic py-2">
                    Pilih item untuk melanjutkan checkout
                  </p>
                )}
                <a
                  href={selectedCount > 0 ? "/checkout" : undefined}
                  className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-body text-[14px] tracking-[0.05em] font-semibold transition-all ${
                    selectedCount > 0
                      ? "bg-primary text-white shadow-soft hover:shadow-float hover:scale-[1.01] active:scale-[0.98] cursor-pointer"
                      : "bg-outline-variant/40 text-on-surface-variant cursor-not-allowed"
                  }`}
                  onClick={(e) => { if (selectedCount === 0) e.preventDefault(); }}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    lock
                  </span>
                  Checkout ({selectedCount} item)
                </a>
                <a
                  href="/"
                  className="w-full flex items-center justify-center gap-2 border border-primary text-primary py-3 rounded-xl font-body text-[13px] tracking-[0.05em] font-semibold hover:bg-primary/5 transition-colors active:scale-[0.98]"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    arrow_back
                  </span>
                  Lanjut Belanja
                </a>
              </div>

              {/* Trust badges */}
              <div className="mt-5 flex items-center justify-center gap-4 text-[10px] text-on-surface-variant">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-secondary">
                    verified_user
                  </span>
                  Pembayaran aman
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-secondary">
                    local_florist
                  </span>
                  Bunga segar
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-secondary">
                    replay
                  </span>
                  Garansi 100%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Recommendations ── */}
      <section className="mt-16 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-headline text-[22px] font-semibold text-on-surface">
            Tambahkan ke bouquet-mu
          </h3>
          <a
            className="text-primary font-body text-[13px] font-semibold hover:underline flex items-center gap-1"
            href="/"
          >
            Lihat Semua
            <span className="material-symbols-outlined text-[16px]">
              arrow_forward
            </span>
          </a>
        </div>
        <div className="flex gap-5 overflow-x-auto hide-scrollbar pb-4">
          {RECOMMENDED.map((item) => (
            <RecommendedCard key={item.id} item={item} />
          ))}
        </div>
      </section>
    </main>
  );
}
