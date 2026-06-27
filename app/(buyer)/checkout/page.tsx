"use client";

import React, { useState } from "react";
import Link from "next/link";
import axios from "axios";

/* ──────────────────────────── Types ──────────────────────────── */

interface CheckoutItem {
  id: string;
  name: string;
  florist: string;
  price: number;
  qty: number;
  image: string;
  flowerType?: string;
  wrappingColor?: string;
  wrappingLabel?: string;
  addons?: { name: string; qty?: number; price: number; icon: string }[];
}

type PaymentMethod = "bca" | "mandiri" | "gopay" | "ovo" | "dana" | "cod";
type DeliverySlot = "morning" | "afternoon" | "evening";

/* ──────────────────────────── Data ──────────────────────────── */

const ORDER_ITEMS: CheckoutItem[] = [
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
  },
];

const PAYMENT_OPTIONS: {
  id: PaymentMethod;
  name: string;
  icon: string;
  category: string;
}[] = [
  { id: "bca", name: "BCA Virtual Account", icon: "account_balance", category: "Transfer Bank" },
  { id: "mandiri", name: "Mandiri Virtual Account", icon: "account_balance", category: "Transfer Bank" },
  { id: "gopay", name: "GoPay", icon: "wallet", category: "E-Wallet" },
  { id: "ovo", name: "OVO", icon: "wallet", category: "E-Wallet" },
  { id: "dana", name: "DANA", icon: "wallet", category: "E-Wallet" },
  { id: "cod", name: "Bayar di Tempat (COD)", icon: "payments", category: "Lainnya" },
];

const DELIVERY_SLOTS: { id: DeliverySlot; label: string; time: string; icon: string }[] = [
  { id: "morning", label: "Pagi", time: "08.00 - 12.00", icon: "wb_sunny" },
  { id: "afternoon", label: "Siang", time: "12.00 - 16.00", icon: "wb_cloudy" },
  { id: "evening", label: "Sore", time: "16.00 - 20.00", icon: "nights_stay" },
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

/* ──────────────────────────── Sub-components ──────────────────────────── */

function StepIndicator({ step }: { step: number }) {
  const steps = [
    { label: "Pengiriman", icon: "local_shipping" },
    { label: "Pembayaran", icon: "payment" },
    { label: step >= 4 ? "Selesai" : "Konfirmasi", icon: "check_circle" },
  ];

  // On step 4 (success), treat as all steps completed
  const effectiveStep = step >= 4 ? 4 : step;

  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {steps.map((s, i) => (
        <React.Fragment key={s.label}>
          <div className="flex items-center gap-2">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-[14px] font-bold transition-all ${
                i + 1 <= effectiveStep
                  ? "bg-primary text-white shadow-soft"
                  : "bg-surface-container-high text-on-surface-variant"
              }`}
            >
              {i + 1 < effectiveStep ? (
                <span className="material-symbols-outlined text-[18px]" style={FILL_STYLE}>check</span>
              ) : (
                <span className="material-symbols-outlined text-[18px]">{s.icon}</span>
              )}
            </div>
            <span
              className={`text-[13px] font-semibold hidden sm:block ${
                i + 1 <= effectiveStep ? "text-primary" : "text-on-surface-variant"
              }`}
            >
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`w-12 sm:w-20 h-[2px] mx-2 rounded-full transition-all ${
                i + 1 < effectiveStep ? "bg-primary" : "bg-outline-variant/30"
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function OrderItemRow({ item }: { item: CheckoutItem }) {
  return (
    <div className="flex gap-4 py-4 border-b border-outline-variant/20 last:border-0">
      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
        <img alt={item.name} className="w-full h-full object-cover" src={item.image} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-[14px] font-semibold text-on-surface truncate">{item.name}</h4>
        <p className="text-[11px] text-on-surface-variant mt-0.5">{item.florist}</p>
        {/* Chips */}
        <div className="flex flex-wrap gap-1 mt-1.5">
          {item.flowerType && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-primary-container/20 text-[9px] font-medium text-on-primary-container">
              <span className="material-symbols-outlined text-[11px]" style={FILL_STYLE}>local_florist</span>
              {item.flowerType}
            </span>
          )}
          {item.wrappingColor && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-surface-container text-[9px] font-medium text-on-surface-variant">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 border border-outline-variant/30" style={{ backgroundColor: item.wrappingColor }} />
              {item.wrappingLabel}
            </span>
          )}
          {item.addons?.map((a) => (
            <span key={a.name} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-secondary-container/20 text-[9px] font-medium text-on-secondary-container">
              <span className="material-symbols-outlined text-[11px]">{a.icon}</span>
              {a.name}{a.qty && a.qty > 1 ? ` ×${a.qty}` : ""}
            </span>
          ))}
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-[14px] font-bold text-on-surface">{formatRupiah(item.price)}</p>
        <p className="text-[11px] text-on-surface-variant">×{item.qty}</p>
      </div>
    </div>
  );
}

/* ──────────────────────────── Page Component ──────────────────────────── */

export default function CheckoutPage() {
  const [step, setStep] = useState(1);
  const [isPaying, setIsPaying] = useState(false);

  // Shipping
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Jakarta Selatan");
  const [postalCode, setPostalCode] = useState("");
  const [addressNote, setAddressNote] = useState("");
  const [deliverySlot, setDeliverySlot] = useState<DeliverySlot>("afternoon");
  const [deliveryDate, setDeliveryDate] = useState("2026-06-16");
  const [giftMessage, setGiftMessage] = useState("");
  const [isGift, setIsGift] = useState(false);

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bca");

  // Order result from API
  const [createdOrder, setCreatedOrder] = useState<any | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);

  // Derived
  const subtotal = ORDER_ITEMS.reduce((sum, item) => sum + item.price * item.qty, 0);
  const deliveryCost = 15000;
  const serviceFee = 5000;
  const total = subtotal + deliveryCost + serviceFee;
  const itemCount = ORDER_ITEMS.reduce((sum, item) => sum + item.qty, 0);

  const canProceedStep1 = recipientName && recipientPhone && address && postalCode;

  const paymentCategories = PAYMENT_OPTIONS.reduce<Record<string, typeof PAYMENT_OPTIONS>>((acc, opt) => {
    if (!acc[opt.category]) acc[opt.category] = [];
    acc[opt.category].push(opt);
    return acc;
  }, {});

  return (
    <main className="pt-6 pb-16 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
      {/* Breadcrumb */}
      <nav className="flex gap-2 text-[12px] leading-4 tracking-[0.03em] font-medium text-on-surface-variant mb-2">
        <Link className="hover:text-primary transition-colors" href="/">Home</Link>
        <span>/</span>
        <Link className="hover:text-primary transition-colors" href="/cart">Keranjang</Link>
        <span>/</span>
        <span className="text-on-surface">Checkout</span>
      </nav>

      <h1 className="font-headline text-[28px] leading-9 font-semibold text-on-surface mb-6">
        Checkout
      </h1>

      <StepIndicator step={step} />

      <div className="grid grid-cols-12 gap-8">
        {/* ── Left Column: Forms ── */}
        <div className="col-span-12 lg:col-span-7 xl:col-span-8 space-y-6">

          {/* ═══ STEP 1: Shipping ═══ */}
          {step === 1 && (
            <>
              {/* Recipient */}
              <section className="bg-white rounded-xl border border-outline-variant/40 p-6 shadow-soft">
                <h3 className="font-body text-[14px] font-semibold text-on-surface flex items-center gap-2 mb-5">
                  <span className="material-symbols-outlined text-primary text-[20px]">person</span>
                  Informasi Penerima
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-semibold text-on-surface-variant">Nama Penerima</label>
                    <input
                      type="text"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="Nama lengkap penerima"
                      className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[13px] font-body focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-semibold text-on-surface-variant">No. Telepon Penerima</label>
                    <input
                      type="tel"
                      value={recipientPhone}
                      onChange={(e) => setRecipientPhone(e.target.value)}
                      placeholder="08xxxxxxxxxx"
                      className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[13px] font-body focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      required
                    />
                  </div>
                </div>
              </section>

              {/* Address */}
              <section className="bg-white rounded-xl border border-outline-variant/40 p-6 shadow-soft">
                <h3 className="font-body text-[14px] font-semibold text-on-surface flex items-center gap-2 mb-5">
                  <span className="material-symbols-outlined text-primary text-[20px]">location_on</span>
                  Alamat Pengiriman
                </h3>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-semibold text-on-surface-variant">Alamat Lengkap</label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Nama jalan, nomor rumah/gedung, RT/RW"
                      rows={3}
                      className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[13px] font-body focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[12px] font-semibold text-on-surface-variant">Kota</label>
                      <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[13px] font-body focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
                      >
                        <option>Jakarta Selatan</option>
                        <option>Jakarta Pusat</option>
                        <option>Jakarta Barat</option>
                        <option>Jakarta Timur</option>
                        <option>Jakarta Utara</option>
                        <option>Tangerang</option>
                        <option>Bandung</option>
                        <option>Surabaya</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[12px] font-semibold text-on-surface-variant">Kode Pos</label>
                      <input
                        type="text"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        placeholder="12345"
                        maxLength={5}
                        className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[13px] font-body focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-semibold text-on-surface-variant">Catatan Alamat <span className="text-outline font-normal">(opsional)</span></label>
                    <input
                      type="text"
                      value={addressNote}
                      onChange={(e) => setAddressNote(e.target.value)}
                      placeholder="Patokan, lantai, blok, dll."
                      className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[13px] font-body focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                </div>
              </section>

              {/* Delivery Schedule */}
              <section className="bg-white rounded-xl border border-outline-variant/40 p-6 shadow-soft">
                <h3 className="font-body text-[14px] font-semibold text-on-surface flex items-center gap-2 mb-5">
                  <span className="material-symbols-outlined text-primary text-[20px]">schedule</span>
                  Jadwal Pengiriman
                </h3>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-semibold text-on-surface-variant">Tanggal Pengiriman</label>
                    <input
                      type="date"
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      min="2026-06-16"
                      className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[13px] font-body focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[12px] font-semibold text-on-surface-variant block mb-2">Pilih Slot Waktu</label>
                    <div className="grid grid-cols-3 gap-3">
                      {DELIVERY_SLOTS.map((slot) => (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => setDeliverySlot(slot.id)}
                          className={`p-3 rounded-xl border-2 text-center transition-all ${
                            deliverySlot === slot.id
                              ? "border-primary bg-primary-container/10"
                              : "border-outline-variant/30 hover:border-primary/40"
                          }`}
                        >
                          <span className={`material-symbols-outlined text-[20px] block mb-1 ${
                            deliverySlot === slot.id ? "text-primary" : "text-on-surface-variant"
                          }`} style={deliverySlot === slot.id ? FILL_STYLE : undefined}>
                            {slot.icon}
                          </span>
                          <span className="text-[13px] font-semibold text-on-surface block">{slot.label}</span>
                          <span className="text-[11px] text-on-surface-variant">{slot.time}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Gift Message */}
              <section className="bg-white rounded-xl border border-outline-variant/40 p-6 shadow-soft">
                <label className="flex items-center justify-between cursor-pointer mb-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">card_giftcard</span>
                    <span className="font-body text-[14px] font-semibold text-on-surface">Kirim sebagai Hadiah?</span>
                  </div>
                  {/* Toggle */}
                  <div
                    className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${
                      isGift ? "bg-primary" : "bg-outline-variant/40"
                    }`}
                    onClick={() => setIsGift(!isGift)}
                  >
                    <div
                      className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                        isGift ? "translate-x-[22px]" : "translate-x-0.5"
                      }`}
                    />
                  </div>
                </label>
                {isGift && (
                  <div className="space-y-1.5 animate-[fadeIn_0.3s_ease]">
                    <label className="text-[12px] font-semibold text-on-surface-variant">Pesan untuk Penerima</label>
                    <textarea
                      value={giftMessage}
                      onChange={(e) => setGiftMessage(e.target.value)}
                      placeholder="Tulis pesan spesial untuk orang tersayang..."
                      rows={3}
                      className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[13px] font-body focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                    />
                    <p className="text-[11px] text-on-surface-variant">Pesan akan dicetak pada kartu ucapan dan disertakan dalam paket.</p>
                  </div>
                )}
              </section>

              {/* Next */}
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!canProceedStep1}
                className="w-full bg-primary text-white py-4 rounded-xl font-body text-[14px] tracking-[0.05em] font-semibold shadow-soft hover:shadow-float hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                Lanjut ke Pembayaran
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </>
          )}

          {/* ═══ STEP 2: Payment ═══ */}
          {step === 2 && (
            <>
              <section className="bg-white rounded-xl border border-outline-variant/40 p-6 shadow-soft">
                <h3 className="font-body text-[14px] font-semibold text-on-surface flex items-center gap-2 mb-5">
                  <span className="material-symbols-outlined text-primary text-[20px]">payment</span>
                  Pilih Metode Pembayaran
                </h3>
                <div className="space-y-5">
                  {Object.entries(paymentCategories).map(([category, options]) => (
                    <div key={category}>
                      <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
                        {category}
                      </p>
                      <div className="space-y-2">
                        {options.map((opt) => (
                          <label
                            key={opt.id}
                            className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                              paymentMethod === opt.id
                                ? "border-primary bg-primary-container/10"
                                : "border-outline-variant/20 hover:border-primary/40"
                            }`}
                          >
                            <input
                              type="radio"
                              name="payment"
                              checked={paymentMethod === opt.id}
                              onChange={() => setPaymentMethod(opt.id)}
                              className="sr-only"
                            />
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              paymentMethod === opt.id
                                ? "bg-primary/10"
                                : "bg-surface-container"
                            }`}>
                              <span className={`material-symbols-outlined text-[20px] ${
                                paymentMethod === opt.id ? "text-primary" : "text-on-surface-variant"
                              }`}>
                                {opt.icon}
                              </span>
                            </div>
                            <span className="text-[14px] font-medium text-on-surface flex-1">{opt.name}</span>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                              paymentMethod === opt.id
                                ? "border-primary"
                                : "border-outline-variant"
                            }`}>
                              {paymentMethod === opt.id && (
                                <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                              )}
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Shipping summary */}
              <section className="bg-white rounded-xl border border-outline-variant/40 p-5 shadow-soft">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-body text-[13px] font-semibold text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-[18px]">location_on</span>
                    Alamat Tujuan
                  </h4>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-[12px] text-primary font-semibold hover:underline"
                  >
                    Ubah
                  </button>
                </div>
                <div className="text-[13px] text-on-surface-variant space-y-0.5 pl-7">
                  <p className="font-semibold text-on-surface">{recipientName} · {recipientPhone}</p>
                  <p>{address}</p>
                  <p>{city} {postalCode}</p>
                  {addressNote && <p className="italic text-[12px]">{addressNote}</p>}
                </div>
              </section>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-6 py-4 border border-outline-variant/40 rounded-xl font-body text-[14px] font-semibold text-on-surface-variant hover:bg-surface-container-high transition-all active:scale-[0.98]"
                >
                  Kembali
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex-1 bg-primary text-white py-4 rounded-xl font-body text-[14px] tracking-[0.05em] font-semibold shadow-soft hover:shadow-float hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  Konfirmasi Pesanan
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </div>
            </>
          )}

          {/* ═══ STEP 3: Confirmation ═══ */}
          {step === 3 && (
            <>
              {/* Success banner */}
              <div className="bg-gradient-to-br from-secondary/10 via-secondary-container/20 to-primary-container/10 rounded-2xl p-8 text-center border border-secondary/20 animate-[fadeIn_0.5s_ease]">
                <div className="w-20 h-20 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-5">
                  <span className="material-symbols-outlined text-secondary text-[40px]" style={FILL_STYLE}>
                    check_circle
                  </span>
                </div>
                <h2 className="font-headline text-[24px] font-semibold text-on-surface mb-2">
                  Pesanan Siap Diproses!
                </h2>
                <p className="text-on-surface-variant text-[14px] font-body max-w-md mx-auto mb-1">
                  Silakan selesaikan pembayaran untuk mengkonfirmasi pesananmu.
                </p>
                <p className="text-[13px] font-semibold text-primary">
                  Order ID: #{createdOrder?.orderNumber || "..."}
                </p>
              </div>

              {/* Final summary cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border border-outline-variant/40 p-5 shadow-soft">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-primary text-[18px]">location_on</span>
                    <span className="text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider">Pengiriman</span>
                  </div>
                  <p className="text-[13px] font-semibold text-on-surface">{recipientName}</p>
                  <p className="text-[12px] text-on-surface-variant mt-0.5">{recipientPhone}</p>
                  <p className="text-[12px] text-on-surface-variant mt-1">{address}, {city} {postalCode}</p>
                  <div className="mt-3 pt-3 border-t border-outline-variant/20 flex items-center gap-2">
                    <span className="material-symbols-outlined text-tertiary text-[16px]">
                      {DELIVERY_SLOTS.find((s) => s.id === deliverySlot)?.icon}
                    </span>
                    <span className="text-[12px] text-on-surface-variant">
                      {deliveryDate} · {DELIVERY_SLOTS.find((s) => s.id === deliverySlot)?.time}
                    </span>
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-outline-variant/40 p-5 shadow-soft">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-primary text-[18px]">payment</span>
                    <span className="text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider">Pembayaran</span>
                  </div>
                  <p className="text-[13px] font-semibold text-on-surface">
                    {PAYMENT_OPTIONS.find((p) => p.id === paymentMethod)?.name}
                  </p>
                  <p className="text-[12px] text-on-surface-variant mt-1">Menunggu pembayaran</p>
                  <div className="mt-3 pt-3 border-t border-outline-variant/20">
                    <p className="text-[20px] font-bold text-primary">{formatRupiah(total)}</p>
                  </div>
                </div>
              </div>

              {/* Gift message display */}
              {isGift && giftMessage && (
                <div className="bg-white rounded-xl border border-outline-variant/40 p-5 shadow-soft">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-tertiary text-[18px]">card_giftcard</span>
                    <span className="text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider">Pesan Hadiah</span>
                  </div>
                  <p className="text-[13px] text-on-surface italic leading-5">&ldquo;{giftMessage}&rdquo;</p>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  disabled={isPaying}
                  onClick={async () => {
                    setIsPaying(true);
                    setOrderError(null);
                    try {
                      const payload = {
                        items: ORDER_ITEMS.map((item) => ({
                          product_id: Number(item.id),
                          quantity: item.qty,
                        })),
                        payment_method: paymentMethod,
                      };
                      const res = await axios.post("/api/user/orders", payload, { withCredentials: true });
                      if (res.data?.status === "success" && res.data?.data) {
                        setCreatedOrder(res.data.data);
                        setStep(4);
                      }
                    } catch (err: any) {
                      setOrderError(
                        err.response?.data?.message ||
                        err.message ||
                        "Gagal membuat pesanan"
                      );
                    } finally {
                      setIsPaying(false);
                    }
                  }}
                  className="flex-1 bg-primary text-white py-4 rounded-xl font-body text-[14px] tracking-[0.05em] font-semibold shadow-soft hover:shadow-float hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait disabled:hover:scale-100"
                >
                  {isPaying ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Memproses Pesanan...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">payment</span>
                      Bayar Sekarang
                    </>
                  )}
                </button>
                {orderError && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-error-container/20 border border-error/20 text-[13px] text-error font-medium">
                    <span className="material-symbols-outlined text-[18px]">error</span>
                    {orderError}
                  </div>
                )}
                <Link
                  href="/"
                  className="px-6 py-4 border border-outline-variant/40 rounded-xl font-body text-[14px] font-semibold text-on-surface-variant hover:bg-surface-container-high transition-all active:scale-[0.98] text-center"
                >
                  Kembali ke Beranda
                </Link>
              </div>
            </>
          )}

          {/* ═══ STEP 4: Payment Success ═══ */}
          {step === 4 && (
            <>
              {/* Success banner */}
              <div className="bg-gradient-to-br from-secondary/15 via-secondary-container/25 to-primary-container/15 rounded-2xl p-10 text-center border border-secondary/20 animate-[fadeIn_0.5s_ease] relative overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-secondary/5 rounded-full" />
                <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-primary/5 rounded-full" />

                <div className="relative z-10">
                  <div className="w-24 h-24 rounded-full bg-secondary/15 flex items-center justify-center mx-auto mb-6 animate-[bounce_0.6s_ease]">
                    <span className="material-symbols-outlined text-secondary text-[48px]" style={FILL_STYLE}>
                      check_circle
                    </span>
                  </div>
                  <h2 className="font-headline text-[28px] font-bold text-on-surface mb-2">
                    Pembayaran Berhasil! 🎉
                  </h2>
                  <p className="text-on-surface-variant text-[15px] font-body max-w-md mx-auto mb-4">
                    Terima kasih! Pesananmu sudah dikonfirmasi dan sedang diproses oleh florist.
                  </p>
                  <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-full px-5 py-2.5 border border-secondary/20">
                    <span className="material-symbols-outlined text-primary text-[16px]">receipt_long</span>
                    <span className="text-[14px] font-bold text-primary">Order ID: #{createdOrder?.orderNumber || "..."}</span>
                  </div>
                </div>
              </div>

              {/* Payment & Delivery Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Delivery info */}
                <div className="bg-white rounded-xl border border-outline-variant/40 p-5 shadow-soft">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-primary text-[18px]">location_on</span>
                    <span className="text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider">Pengiriman</span>
                  </div>
                  <p className="text-[13px] font-semibold text-on-surface">{recipientName}</p>
                  <p className="text-[12px] text-on-surface-variant mt-0.5">{recipientPhone}</p>
                  <p className="text-[12px] text-on-surface-variant mt-1">{address}, {city} {postalCode}</p>
                  <div className="mt-3 pt-3 border-t border-outline-variant/20 flex items-center gap-2">
                    <span className="material-symbols-outlined text-tertiary text-[16px]">
                      {DELIVERY_SLOTS.find((s) => s.id === deliverySlot)?.icon}
                    </span>
                    <span className="text-[12px] text-on-surface-variant">
                      {deliveryDate} · {DELIVERY_SLOTS.find((s) => s.id === deliverySlot)?.time}
                    </span>
                  </div>
                </div>

                {/* Payment confirmation */}
                <div className="bg-white rounded-xl border border-secondary/20 p-5 shadow-soft">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-secondary text-[18px]" style={FILL_STYLE}>check_circle</span>
                    <span className="text-[12px] font-semibold text-secondary uppercase tracking-wider">Pembayaran Dikonfirmasi</span>
                  </div>
                  <p className="text-[13px] font-semibold text-on-surface">
                    {PAYMENT_OPTIONS.find((p) => p.id === paymentMethod)?.name}
                  </p>
                  <p className="text-[12px] text-secondary mt-1 font-medium">Lunas</p>
                  <div className="mt-3 pt-3 border-t border-outline-variant/20">
                    <p className="text-[20px] font-bold text-primary">{formatRupiah(total)}</p>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-white rounded-xl border border-outline-variant/40 p-6 shadow-soft">
                <h3 className="font-body text-[13px] font-semibold text-on-surface-variant uppercase tracking-wider mb-5">Status Pesanan</h3>
                <div className="space-y-4">
                  {[
                    { icon: "check_circle", label: "Pesanan dikonfirmasi", time: "Baru saja", active: true },
                    { icon: "payments", label: "Pembayaran diterima", time: "Baru saja", active: true },
                    { icon: "local_florist", label: "Florist sedang merangkai", time: "Estimasi 2-3 jam", active: false },
                    { icon: "local_shipping", label: "Dalam pengiriman", time: `${deliveryDate}`, active: false },
                    { icon: "done_all", label: "Pesanan diterima", time: "-", active: false },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        item.active ? "bg-secondary/15" : "bg-surface-container"
                      }`}>
                        <span className={`material-symbols-outlined text-[16px] ${
                          item.active ? "text-secondary" : "text-outline"
                        }`} style={item.active ? FILL_STYLE : undefined}>
                          {item.icon}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className={`text-[13px] font-semibold ${
                          item.active ? "text-on-surface" : "text-on-surface-variant/50"
                        }`}>{item.label}</p>
                        <p className={`text-[11px] ${
                          item.active ? "text-secondary font-medium" : "text-outline"
                        }`}>{item.time}</p>
                      </div>
                      {item.active && (
                        <span className="material-symbols-outlined text-secondary text-[16px]" style={FILL_STYLE}>
                          check
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/profile"
                  className="flex-1 bg-primary text-white py-4 rounded-xl font-body text-[14px] tracking-[0.05em] font-semibold shadow-soft hover:shadow-float hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
                  Lihat Pesanan Saya
                </Link>
                <Link
                  href="/"
                  className="px-6 py-4 border border-outline-variant/40 rounded-xl font-body text-[14px] font-semibold text-on-surface-variant hover:bg-surface-container-high transition-all active:scale-[0.98] text-center"
                >
                  Kembali ke Beranda
                </Link>
              </div>
            </>
          )}
        </div>

        {/* ── Right Column: Order Summary (sticky) ── */}
        <div className="col-span-12 lg:col-span-5 xl:col-span-4">
          <div className="sticky top-24 space-y-5">
            {/* Items */}
            <div className="bg-white rounded-xl border border-outline-variant/40 p-5 shadow-soft">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-body text-[13px] font-semibold text-on-surface-variant uppercase tracking-wider">
                  Pesananmu
                </h3>
                <Link href="/cart" className="text-[12px] text-primary font-semibold hover:underline">
                  Edit
                </Link>
              </div>
              <div className="divide-y divide-outline-variant/20">
                {ORDER_ITEMS.map((item) => (
                  <OrderItemRow key={item.id} item={item} />
                ))}
              </div>
            </div>

            {/* Price breakdown */}
            <div className="bg-white rounded-xl border border-outline-variant/40 p-5 shadow-soft">
              <h3 className="font-body text-[13px] font-semibold text-on-surface-variant uppercase tracking-wider mb-4">
                Ringkasan Biaya
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-[13px]">
                  <span className="text-on-surface-variant">Subtotal ({itemCount} item)</span>
                  <span className="font-medium text-on-surface">{formatRupiah(subtotal)}</span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span className="text-on-surface-variant">Ongkos Kirim</span>
                  <span className="font-medium text-on-surface">{formatRupiah(deliveryCost)}</span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span className="text-on-surface-variant">Biaya Layanan</span>
                  <span className="font-medium text-on-surface">{formatRupiah(serviceFee)}</span>
                </div>
                <hr className="border-outline-variant/30" />
                <div className="flex justify-between items-center pt-1">
                  <span className="font-bold text-on-surface text-[15px]">Total Pembayaran</span>
                  <span className="text-[22px] font-bold text-primary">{formatRupiah(total)}</span>
                </div>
              </div>
            </div>

            {/* Guarantee */}
            <div className="bg-secondary-container/10 rounded-xl border border-secondary/10 p-4">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-secondary text-[22px] mt-0.5" style={FILL_STYLE}>
                  verified_user
                </span>
                <div>
                  <p className="text-[13px] font-semibold text-on-surface">Garansi Flowera</p>
                  <p className="text-[11px] text-on-surface-variant leading-4 mt-1">
                    Jika bunga tidak segar saat diterima, kami ganti 100% tanpa syarat. Kepuasan pelanggan adalah prioritas kami.
                  </p>
                </div>
              </div>
            </div>

            {/* Security badges */}
            <div className="flex items-center justify-center gap-5 text-[10px] text-on-surface-variant py-2">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-secondary">lock</span>
                SSL 256-bit
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-secondary">shield</span>
                PCI DSS
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-secondary">verified_user</span>
                Terverifikasi
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
