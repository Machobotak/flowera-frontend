"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAddresses } from "@/hooks/use-addresses";
import { useShippingOptions } from "@/hooks/use-shipping-options";
import { useCheckoutFlow } from "@/hooks/use-checkout-flow";
import { usePaymentStatus } from "@/hooks/use-payment-status";
import { FILL_STYLE, formatRupiah } from "@/utils/format";
import StepIndicator from "@/components/buyer-checkout/step-indicator";
import OrderItemRow from "@/components/buyer-checkout/order-item-row";
import ErrorBanner from "@/components/buyer-checkout/error-banner";
import AddressDisplayCard from "@/components/buyer-checkout/address-display-card";
import CourierSelectModal from "@/components/buyer-checkout/courier-select-modal";
import OrderSummarySidebar from "@/components/buyer-checkout/order-summary-sidebar";
import QrLightbox from "@/components/buyer-checkout/qr-lightbox";
import type { ShippingOption } from "@/types/checkout";

/* ──────────────────────────── QR Countdown ──────────────────────────── */

function QrCountdown({ expiredAt, createdAt }: { expiredAt: string | null; createdAt: string }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const expireAt = expiredAt
      ? new Date(expiredAt)
      : new Date(new Date(createdAt || Date.now()).getTime() + 24 * 3600000);

    const tick = () => {
      const diff = expireAt.getTime() - Date.now();
      if (diff <= 0) { setTimeLeft("⏰ Waktu pembayaran habis"); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`⏳ ${h}j ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}d`);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [expiredAt, createdAt]);

  if (!timeLeft) return null;

  return (
    <p className={`text-[13px] font-semibold mb-3 ${timeLeft.includes("habis") ? "text-error" : "text-tertiary"}`}>
      {timeLeft}
    </p>
  );
}

/* ──────────────────────────── Types ──────────────────────────── */

interface CheckoutItem {
  id: string;
  product_id: number;
  product_variant_id?: number;
  store_id: number;
  name: string;
  florist: string;
  price: number;
  qty: number;
  image: string;
  weight_gram: number;
  origin_zip?: string;
  flowerType?: string;
  wrappingColor?: string;
  wrappingLabel?: string;
  addons?: { name: string; qty?: number; price: number; icon: string; image?: string }[];
}

type PaymentMethod = "qris";

/* ──────────────────────────── Data ──────────────────────────── */

const FALLBACK_ITEMS: CheckoutItem[] = [
  {
    id: "1",
    product_id: 40,
    product_variant_id: 13,
    store_id: 25,
    name: "Midnight Grace",
    florist: "The Velvet Rose Florist",
    price: 450000,
    qty: 2,
    weight_gram: 1000,
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
    product_id: 23,
    store_id: 26,
    name: "Cloud Nine",
    florist: "Petals & Prose",
    price: 875000,
    qty: 1,
    weight_gram: 500,
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

/** Load checkout items — prefers sessionStorage (direct buy) over fallback mock data.
 *  Data persists across refreshes; cleared only after successful order placement. */
function loadCheckoutItems(): CheckoutItem[] {
  if (typeof window === "undefined") return FALLBACK_ITEMS;
  try {
    const stored = sessionStorage.getItem("directCheckoutItems");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Keep in sessionStorage — cleared only on successful order
        return parsed.map((item: any, i: number) => ({
          ...item,
          id: item.id || `direct-${i}`,
          qty: item.qty || 1,
          weight_gram: item.weight_gram || 500,
          image: item.image || "https://ui-avatars.com/api/?name=Product&background=8c4a5c&color=fff",
        }));
      }
    }
  } catch {
    // ignore parse errors
  }
  return FALLBACK_ITEMS;
}

const PAYMENT_OPTIONS: {
  id: PaymentMethod;
  name: string;
  icon: string;
  category: string;
}[] = [
  { id: "qris", name: "QRIS", icon: "qr_code", category: "Pembayaran" },
];

/* ──────────────────────────── Helpers ──────────────────────────── */

/* ──────────────────────────── Page Component ──────────────────────────── */

export default function CheckoutPage() {
  const [step, setStep] = useState(1);

  // Checkout items — start with fallback to match SSR, then swap after hydration
  const [orderItems, setOrderItems] = useState<CheckoutItem[]>(FALLBACK_ITEMS);

  /* ── Payment (UI-only state, not in hooks) ── */
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("qris");
  const [orderNote, setOrderNote] = useState("");
  const [deliveryDate, setDeliveryDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [isGift, setIsGift] = useState(false);
  const [giftMessage, setGiftMessage] = useState("");

  // ── Hooks ──
  const { addresses, addressesLoading, selectedAddressId, selectedAddress, setSelectedAddressId } = useAddresses();
  const { shippingOptionsByStore, shippingOptionsLoading, selectedShipping, courierModalStoreId,
          setCourierModalStoreId, fetchShippingOptions, handleShippingSelect } = useShippingOptions();
  const { previewData, previewLoading, isPlacingOrder, createdOrder, errorMsg, setErrorMsg,
          verifyCheckoutPreview, placeOrder } = useCheckoutFlow();
  const { qrUrl, paymentStatus, expiredAt, isCheckingPayment, qrLightbox, setQrLightbox,
          setQrFromCheckout, checkPaymentStatus } = usePaymentStatus();

  /* ── Load direct-buy items from sessionStorage after hydration ── */
  useEffect(() => {
    const items = loadCheckoutItems();
    if (items !== FALLBACK_ITEMS) {
      setOrderItems(items);
    }
  }, []);

  /* ──────────────────────────── Derived ──────────────────────────── */

  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const itemCount = orderItems.reduce((sum, item) => sum + item.qty, 0);
  const shippingTotal = Object.values(selectedShipping).reduce((sum, s) => sum + s.shipping_cost, 0);
  const serviceFee = 1000;
  const total = subtotal + shippingTotal + serviceFee;

  const uniqueStoreIds = useMemo(
    () => [...new Set(orderItems.map((item) => item.store_id))],
    [orderItems]
  );

  const allShippingSelected = uniqueStoreIds.length > 0
    ? uniqueStoreIds.every((storeId) => selectedShipping[storeId])
    : false;

  const canProceedStep1 = selectedAddressId !== null;

  /* ──────────────────────────── Step handlers ──────────────────────────── */

  function handleStep1Next() {
    fetchShippingOptions(selectedAddressId, orderItems);
    setStep(2);
  }

  async function handleVerifyAndProceed() {
    const ok = await verifyCheckoutPreview(selectedAddressId, orderItems, selectedShipping);
    if (ok) setStep(4);
  }

  async function handlePlaceOrder() {
    const data = await placeOrder(selectedAddressId, orderItems, selectedShipping, paymentMethod, orderNote, isGift, giftMessage);
    if (data) {
      setQrFromCheckout(data);
      setStep(5);
    }
  }

  // Auto-fetch payment status when QR appears to get the real expired_at
  useEffect(() => {
    if (qrUrl && createdOrder) {
      checkPaymentStatus(createdOrder);
    }
  }, [qrUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  const router = useRouter();

  // Redirect to Pesanan Saya when payment is settled/paid
  useEffect(() => {
    if (paymentStatus === "settlement" || paymentStatus === "PAID") {
      const timer = setTimeout(() => router.push("/profile"), 2000);
      return () => clearTimeout(timer);
    }
  }, [paymentStatus, router]);

  // Warn before leaving after checkout (step 5 = payment screen)
  useEffect(() => {
    if (step !== 5) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [step]);

  function handleCheckPayment() {
    checkPaymentStatus(createdOrder);
  }

  const paymentCategories = PAYMENT_OPTIONS.reduce<Record<string, typeof PAYMENT_OPTIONS>>((acc, opt) => {
    if (!acc[opt.category]) acc[opt.category] = [];
    acc[opt.category].push(opt);
    return acc;
  }, {});

  return (
    <main className="pt-6 pb-20 md:pb-16 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
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

      <ErrorBanner message={errorMsg} onDismiss={() => setErrorMsg(null)} />

      <div className="grid grid-cols-12 gap-8">
        {/* ── Left Column: Forms ── */}
        <div className="col-span-12 lg:col-span-7 xl:col-span-8 space-y-6">

          {/* ═══ STEP 1: Select Address ═══ */}
          {step === 1 && (
            <>
              <section className="bg-white rounded-xl border border-outline-variant/40 p-6 shadow-soft">
                <h3 className="font-body text-[14px] font-semibold text-on-surface flex items-center gap-2 mb-5">
                  <span className="material-symbols-outlined text-primary text-[20px]">location_on</span>
                  Pilih Alamat Pengiriman
                </h3>

                {addressesLoading && (
                  <div className="flex items-center justify-center py-8 gap-3">
                    <span className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <span className="text-[13px] text-on-surface-variant">Memuat alamat...</span>
                  </div>
                )}

                {!addressesLoading && addresses.length === 0 && (
                  <div className="text-center py-8">
                    <span className="material-symbols-outlined text-[40px] text-outline-variant/40 mb-2 block">location_off</span>
                    <p className="text-[14px] text-on-surface-variant mb-4">
                      Belum ada alamat tersimpan
                    </p>
                    <Link
                      href="/profile/account?tab=address"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-[13px] font-semibold hover:shadow-float transition-all"
                    >
                      <span className="material-symbols-outlined text-[16px]">add</span>
                      Tambah Alamat
                    </Link>
                  </div>
                )}

                {!addressesLoading && addresses.length > 0 && (
                  <div className="space-y-3">
                    {addresses.map((addr) => (
                      <label
                        key={addr.id}
                        className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          selectedAddressId === addr.id
                            ? "border-primary bg-primary-container/10"
                            : "border-outline-variant/20 hover:border-primary/40"
                        }`}
                      >
                        <input
                          type="radio"
                          name="address"
                          checked={selectedAddressId === addr.id}
                          onChange={() => setSelectedAddressId(addr.id)}
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                          selectedAddressId === addr.id ? "border-primary" : "border-outline-variant"
                        }`}>
                          {selectedAddressId === addr.id && (
                            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[14px] font-semibold text-on-surface">
                              {addr.nama_penerima}
                            </span>
                            <span className="text-[12px] text-on-surface-variant">
                              {addr.no_hp}
                            </span>
                          </div>
                          <p className="text-[13px] text-on-surface-variant leading-5">
                            {addr.address}
                            {addr.subdistrict_name && `, ${addr.subdistrict_name}`}
                            {addr.district_name && `, ${addr.district_name}`}
                            {addr.city_name && `, ${addr.city_name}`}
                            {addr.province_name && `, ${addr.province_name}`}
                            {addr.zip_code && ` ${addr.zip_code}`}
                          </p>
                          {addr.note && (
                            <p className="text-[12px] text-on-surface-variant italic mt-1">
                              Catatan: {addr.note}
                            </p>
                          )}
                        </div>
                        <Link
                          href={`/profile/account?tab=address&edit=${addr.id}`}
                          className="text-[12px] text-primary font-medium hover:underline flex-shrink-0 mt-0.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Ubah
                        </Link>
                      </label>
                    ))}

                    <Link
                      href="/profile/account?tab=address"
                      className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-outline-variant/40 rounded-xl text-[13px] font-medium text-primary hover:border-primary/60 hover:bg-primary/5 transition-all"
                    >
                      <span className="material-symbols-outlined text-[18px]">add</span>
                      Tambah Alamat Baru
                    </Link>
                  </div>
                )}
              </section>

              {/* Gift option */}
              <section className="bg-white rounded-xl border border-outline-variant/40 p-6 shadow-soft">
                <label className="flex items-center justify-between cursor-pointer mb-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">card_giftcard</span>
                    <span className="font-body text-[14px] font-semibold text-on-surface">Kirim sebagai Hadiah?</span>
                  </div>
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
                  </div>
                )}
              </section>

              {/* Next */}
              <button
                type="button"
                onClick={handleStep1Next}
                disabled={!canProceedStep1}
                className="w-full bg-primary text-white py-4 rounded-xl font-body text-[14px] tracking-[0.05em] font-semibold shadow-soft hover:shadow-float hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                Lanjut ke Pengiriman
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </>
          )}

          {/* ═══ STEP 2: Shipping per Store ═══ */}
          {step === 2 && (
            <>
              {selectedAddress && (
                <AddressDisplayCard address={selectedAddress} onEdit={() => setStep(1)} />
              )}

              {/* Shipping per store */}
              {shippingOptionsLoading && (
                <section className="bg-white rounded-xl border border-outline-variant/40 p-6 shadow-soft">
                  <div className="flex flex-col items-center justify-center py-8 gap-3">
                    <span className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <p className="text-[14px] text-on-surface-variant">Menghitung ongkos kirim...</p>
                  </div>
                </section>
              )}

              {!shippingOptionsLoading && Object.keys(shippingOptionsByStore).length > 0 && uniqueStoreIds.map((storeId) => {
                const storeItems = orderItems.filter((item) => item.store_id === storeId);
                const shippingOpts = shippingOptionsByStore[storeId] || [];
                const selected = selectedShipping[storeId];

                return (
                  <section
                    key={storeId}
                    className="bg-white rounded-xl border border-outline-variant/40 p-5 shadow-soft"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-body text-[14px] font-semibold text-on-surface flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[20px]">storefront</span>
                        {storeItems[0]?.florist || `Toko #${storeId}`}
                      </h3>
                    </div>

                    {/* Items in this store (compact) */}
                    <div className="space-y-1.5 mb-4">
                      {storeItems.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 text-[12px]">
                          <img src={item.image} alt={item.name} className="w-8 h-8 rounded-md object-cover" />
                          <span className="flex-1 text-on-surface truncate">{item.name}</span>
                          <span className="text-on-surface-variant">×{item.qty}</span>
                        </div>
                      ))}
                    </div>

                    {/* Courier selector — compact button */}
                    {shippingOpts.length === 0 ? (
                      <p className="text-[12px] text-on-surface-variant italic">
                        Tidak ada opsi pengiriman tersedia
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setCourierModalStoreId(storeId)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                          selected
                            ? "border-primary bg-primary-container/5"
                            : "border-outline-variant/30 hover:border-primary/50"
                        }`}
                      >
                        {selected ? (
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <span className="material-symbols-outlined text-primary text-[20px]" style={FILL_STYLE}>
                              local_shipping
                            </span>
                            <div className="text-left flex-1 min-w-0">
                              <p className="text-[13px] font-semibold text-on-surface truncate">
                                {selected.courier_name} · {selected.courier_service}
                              </p>
                              <p className="text-[11px] text-on-surface-variant">
                                Estimasi {selected.shipping_etd}
                              </p>
                            </div>
                            <span className="text-[14px] font-bold text-primary flex-shrink-0">
                              {formatRupiah(selected.shipping_cost)}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-on-surface-variant text-[20px]">
                              local_shipping
                            </span>
                            <span className="text-[13px] text-on-surface-variant">Pilih Kurir</span>
                          </div>
                        )}
                        <span className="material-symbols-outlined text-on-surface-variant text-[18px] ml-2">
                          {selected ? "swap_horiz" : "chevron_right"}
                        </span>
                      </button>
                    )}
                  </section>
                );
              })}

              {/* Fallback if no shipping data yet */}
              {!shippingOptionsLoading && Object.keys(shippingOptionsByStore).length === 0 && (
                <section className="bg-white rounded-xl border border-outline-variant/40 p-6 shadow-soft text-center py-8">
                  <span className="material-symbols-outlined text-[40px] text-outline-variant/40 mb-2 block">local_shipping</span>
                  <p className="text-[14px] text-on-surface-variant">
                    Pilih alamat terlebih dahulu untuk melihat opsi pengiriman.
                  </p>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="mt-3 text-primary font-semibold text-[13px] hover:underline"
                  >
                    ← Kembali ke alamat
                  </button>
                </section>
              )}

              <CourierSelectModal
                storeId={courierModalStoreId}
                storeName={courierModalStoreId !== null ? (orderItems.find((i) => i.store_id === courierModalStoreId)?.florist || `Toko #${courierModalStoreId}`) : ""}
                shippingOptions={courierModalStoreId !== null ? (shippingOptionsByStore[courierModalStoreId] || []) : []}
                selected={courierModalStoreId !== null ? selectedShipping[courierModalStoreId] : undefined}
                onSelect={handleShippingSelect}
                onClose={() => setCourierModalStoreId(null)}
              />

              {/* Navigation */}
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
                  disabled={!allShippingSelected}
                  className="flex-1 bg-primary text-white py-4 rounded-xl font-body text-[14px] tracking-[0.05em] font-semibold shadow-soft hover:shadow-float hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  Lanjut ke Pembayaran
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </div>
            </>
          )}

          {/* ═══ STEP 3: Payment ═══ */}
          {step === 3 && (
            <>
              {/* Payment Method */}
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

              {/* Order Note */}
              <section className="bg-white rounded-xl border border-outline-variant/40 p-6 shadow-soft">
                <h3 className="font-body text-[14px] font-semibold text-on-surface flex items-center gap-2 mb-5">
                  <span className="material-symbols-outlined text-primary text-[20px]">edit_note</span>
                  Catatan Pesanan
                </h3>
                <textarea
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  placeholder="Tulis catatan untuk penjual (opsional)..."
                  rows={3}
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[13px] font-body focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                />
                <div className="mt-4 space-y-1.5">
                  <label className="text-[12px] font-semibold text-on-surface-variant">Tanggal Pengiriman</label>
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[13px] font-body focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </section>

              {/* Shipping & Address summary */}
              <section className="bg-white rounded-xl border border-outline-variant/40 p-5 shadow-soft">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-body text-[13px] font-semibold text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-[18px]">location_on</span>
                    Alamat & Pengiriman
                  </h4>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-[12px] text-primary font-semibold hover:underline"
                  >
                    Ubah
                  </button>
                </div>
                {selectedAddress && (
                  <div className="text-[13px] text-on-surface-variant space-y-0.5 pl-7 mb-3">
                    <p className="font-semibold text-on-surface">{selectedAddress.nama_penerima} · {selectedAddress.no_hp}</p>
                    <p>{selectedAddress.address}</p>
                    <p>
                      {[selectedAddress.city_name, selectedAddress.province_name, selectedAddress.zip_code]
                        .filter(Boolean)
                        .join(" ")}
                    </p>
                  </div>
                )}
                {/* Shipping summary per store */}
                {Object.values(selectedShipping).map((s) => (
                  <div key={s.store_id} className="flex items-center gap-2 pl-7 text-[12px] text-on-surface-variant mt-1">
                    <span className="material-symbols-outlined text-[14px]">local_shipping</span>
                    <span>{s.courier_name} ({s.courier_service})</span>
                    <span className="font-semibold text-on-surface ml-auto">{formatRupiah(s.shipping_cost)}</span>
                  </div>
                ))}
              </section>

              {/* Navigation */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-4 border border-outline-variant/40 rounded-xl font-body text-[14px] font-semibold text-on-surface-variant hover:bg-surface-container-high transition-all active:scale-[0.98]"
                >
                  Kembali
                </button>
                <button
                  type="button"
                  disabled={previewLoading}
                  onClick={handleVerifyAndProceed}
                  className="flex-1 bg-primary text-white py-4 rounded-xl font-body text-[14px] tracking-[0.05em] font-semibold shadow-soft hover:shadow-float hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {previewLoading ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Verifikasi...
                    </>
                  ) : (
                    <>
                      Konfirmasi Pesanan
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}

          {/* ═══ STEP 4: Confirmation + Place Order ═══ */}
          {step === 4 && (
            <>
              {/* Review card */}
              <div className="bg-gradient-to-br from-secondary/10 via-secondary-container/20 to-primary-container/10 rounded-2xl p-8 text-center border border-secondary/20 animate-[fadeIn_0.5s_ease]">
                <div className="w-20 h-20 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-5">
                  <span className="material-symbols-outlined text-secondary text-[40px]" style={FILL_STYLE}>
                    receipt_long
                  </span>
                </div>
                <h2 className="font-headline text-[24px] font-semibold text-on-surface mb-2">
                  Konfirmasi Pesanan
                </h2>
                <p className="text-on-surface-variant text-[14px] font-body max-w-md mx-auto">
                  Pastikan semua detail pesanan sudah benar sebelum melanjutkan pembayaran.
                </p>
              </div>

              {/* Summary cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border border-outline-variant/40 p-5 shadow-soft">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-primary text-[18px]">location_on</span>
                    <span className="text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider">Pengiriman</span>
                  </div>
                  {selectedAddress && (
                    <>
                      <p className="text-[13px] font-semibold text-on-surface">{selectedAddress.nama_penerima}</p>
                      <p className="text-[12px] text-on-surface-variant mt-0.5">{selectedAddress.no_hp}</p>
                      <p className="text-[12px] text-on-surface-variant mt-1">
                        {selectedAddress.address}, {[selectedAddress.city_name, selectedAddress.province_name].filter(Boolean).join(", ")} {selectedAddress.zip_code}
                      </p>
                    </>
                  )}
                  <div className="mt-3 pt-3 border-t border-outline-variant/20">
                    {Object.values(selectedShipping).map((s) => (
                      <div key={s.store_id} className="flex items-center gap-2 text-[12px] text-on-surface-variant">
                        <span className="material-symbols-outlined text-[14px]">local_shipping</span>
                        <span>{s.courier_name} {s.courier_service} · {s.shipping_etd}</span>
                      </div>
                    ))}
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

              {/* Order note display */}
              {orderNote && (
                <div className="bg-white rounded-xl border border-outline-variant/40 p-5 shadow-soft">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-tertiary text-[18px]">edit_note</span>
                    <span className="text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider">Catatan</span>
                  </div>
                  <p className="text-[13px] text-on-surface">{orderNote}</p>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={isPlacingOrder}
                  className="px-6 py-4 border border-outline-variant/40 rounded-xl font-body text-[14px] font-semibold text-on-surface-variant hover:bg-surface-container-high transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  Kembali
                </button>
                <button
                  type="button"
                  disabled={isPlacingOrder}
                  onClick={handlePlaceOrder}
                  className="flex-1 bg-primary text-white py-4 rounded-xl font-body text-[14px] tracking-[0.05em] font-semibold shadow-soft hover:shadow-float hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait disabled:hover:scale-100"
                >
                  {isPlacingOrder ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Memproses Pesanan...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">payment</span>
                      Bayar {formatRupiah(total)}
                    </>
                  )}
                </button>
              </div>
            </>
          )}

          {/* ═══ STEP 5: Success ═══ */}
          {step === 5 && (
            <>
              {/* Success banner */}
              <div className="bg-gradient-to-br from-secondary/15 via-secondary-container/25 to-primary-container/15 rounded-2xl p-10 text-center border border-secondary/20 animate-[fadeIn_0.5s_ease] relative overflow-hidden">
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-secondary/5 rounded-full" />
                <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-primary/5 rounded-full" />

                <div className="relative z-10">
                  <div className="w-24 h-24 rounded-full bg-secondary/15 flex items-center justify-center mx-auto mb-6 animate-[bounce_0.6s_ease]">
                    <span className="material-symbols-outlined text-secondary text-[48px]" style={FILL_STYLE}>
                      check_circle
                    </span>
                  </div>
                  <h2 className="font-headline text-[28px] font-bold text-on-surface mb-2">
                    Pesanan Berhasil Dibuat! 🎉
                  </h2>
                  <p className="text-on-surface-variant text-[15px] font-body max-w-md mx-auto mb-4">
                    Terima kasih! Pesananmu sudah terkirim ke penjual. Silakan selesaikan pembayaran untuk memproses pesanan.
                  </p>
                  <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-full px-5 py-2.5 border border-secondary/20">
                    <span className="material-symbols-outlined text-primary text-[16px]">receipt_long</span>
                    <span className="text-[14px] font-bold text-primary">
                      Order ID: #{createdOrder?.orderNumber || createdOrder?.order_number || "..."}
                    </span>
                  </div>
                </div>
              </div>

              {/* Summary cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border border-outline-variant/40 p-5 shadow-soft">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-primary text-[18px]">location_on</span>
                    <span className="text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider">Pengiriman</span>
                  </div>
                  {selectedAddress && (
                    <>
                      <p className="text-[13px] font-semibold text-on-surface">{selectedAddress.nama_penerima}</p>
                      <p className="text-[12px] text-on-surface-variant mt-0.5">{selectedAddress.no_hp}</p>
                      <p className="text-[12px] text-on-surface-variant mt-1">
                        {selectedAddress.address}, {[selectedAddress.city_name, selectedAddress.province_name].filter(Boolean).join(", ")} {selectedAddress.zip_code}
                      </p>
                    </>
                  )}
                  <div className="mt-3 pt-3 border-t border-outline-variant/20">
                    {Object.values(selectedShipping).map((s) => (
                      <div key={s.store_id} className="flex items-center gap-2 text-[12px] text-on-surface-variant">
                        <span className="material-symbols-outlined text-[14px]">local_shipping</span>
                        <span>{s.courier_name} {s.courier_service} · {s.shipping_etd}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-secondary/20 p-5 shadow-soft">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-secondary text-[18px]" style={FILL_STYLE}>check_circle</span>
                    <span className="text-[12px] font-semibold text-secondary uppercase tracking-wider">Menunggu Pembayaran</span>
                  </div>
                  <p className="text-[13px] font-semibold text-on-surface">
                    {PAYMENT_OPTIONS.find((p) => p.id === paymentMethod)?.name}
                  </p>
                  <p className="text-[12px] text-on-surface-variant mt-1">
                    Status: {createdOrder?.status || "pending"}
                  </p>
                  <div className="mt-3 pt-3 border-t border-outline-variant/20">
                    <p className="text-[20px] font-bold text-primary">{formatRupiah(total)}</p>
                  </div>
                </div>
              </div>

              {/* QRIS Payment Card */}
              {qrUrl && (
                <div className="bg-white rounded-xl border-2 border-primary/30 p-6 shadow-soft text-center">
                  <h3 className="font-body text-[14px] font-semibold text-on-surface mb-4 flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[22px]">qr_code</span>
                    Bayar dengan QRIS
                  </h3>
                  {/* Countdown */}
                  <QrCountdown expiredAt={expiredAt} createdAt={createdOrder?.createdAt || ""} />
                  {/* QR Image — large + tap to open lightbox */}
                  <button
                    type="button"
                    onClick={() => setQrLightbox(true)}
                    className="inline-block bg-white border-2 border-outline-variant/20 rounded-xl p-3 mb-3 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer active:scale-[0.98]"
                    title="Klik untuk memperbesar QR"
                  >
                    <img
                      src={qrUrl}
                      alt="QR Code Pembayaran"
                      className="w-64 h-64 sm:w-72 sm:h-72 object-contain"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  </button>
                  <p className="text-[13px] text-on-surface-variant mb-5">
                    Klik gambar QR untuk memperbesar, lalu scan menggunakan e-wallet atau mobile banking kamu
                  </p>
                  <button
                    type="button"
                    onClick={handleCheckPayment}
                    disabled={isCheckingPayment}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-primary text-white rounded-xl text-[14px] font-semibold shadow-soft hover:shadow-float hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60"
                  >
                    {isCheckingPayment ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Mengecek...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[18px]">refresh</span>
                        Cek Status Pembayaran
                      </>
                    )}
                  </button>
                  {paymentStatus && (
                    <p className={`mt-4 text-[14px] font-semibold ${
                      paymentStatus === "settlement" || paymentStatus === "PAID"
                        ? "text-secondary"
                        : "text-tertiary"
                    }`}>
                      {paymentStatus === "settlement" || paymentStatus === "PAID" ? (
                        <span className="flex items-center justify-center gap-1.5">
                          <span className="material-symbols-outlined text-[18px]" style={FILL_STYLE}>check_circle</span>
                          Pembayaran Lunas
                        </span>
                      ) : (
                        `Status: ${paymentStatus}`
                      )}
                    </p>
                  )}
                </div>
              )}

              {/* Timeline */}
              <div className="bg-white rounded-xl border border-outline-variant/40 p-6 shadow-soft">
                <h3 className="font-body text-[13px] font-semibold text-on-surface-variant uppercase tracking-wider mb-5">Status Pesanan</h3>
                <div className="space-y-4">
                  {[
                    { icon: "check_circle", label: "Pesanan dibuat", time: "Baru saja", active: true },
                    { icon: "payments", label: paymentStatus === "settlement" ? "Pembayaran lunas" : "Menunggu pembayaran", time: paymentStatus === "settlement" ? "Pembayaran diterima" : "Silakan lakukan pembayaran", active: true },
                    { icon: "local_florist", label: "Penjual memproses pesanan", time: "Menunggu pembayaran", active: false },
                    { icon: "local_shipping", label: "Dalam pengiriman", time: "-", active: false },
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

        <OrderSummarySidebar
          orderItems={orderItems}
          subtotal={subtotal}
          itemCount={itemCount}
          shippingTotal={shippingTotal}
          serviceFee={serviceFee}
          total={total}
          selectedShipping={selectedShipping}
        />
      </div>

      <QrLightbox qrUrl={qrUrl} isOpen={qrLightbox} onClose={() => setQrLightbox(false)} />
    </main>
  );
}
