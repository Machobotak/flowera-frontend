"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuth } from "@/contexts/auth-context";
import { getBuyerOrders, confirmOrderImage, confirmReceived } from "@/utils/user-order-api";
import { getBuyerStatusLabel, getBuyerFilterKey, deriveServiceFee } from "@/utils/order-utils";
import { getProductImageUrl } from "@/utils/image-url";
import QrLightbox from "@/components/buyer-checkout/qr-lightbox";
import type { UserOrder } from "@/types/order";

/* ──────────────────────────── Types ──────────────────────────── */

type OrderFilter = "all" | "pending" | "paid" | "processing" | "shipped" | "completed" | "cancelled";

interface OrderImageConfirmed {
  id: number;
  image_url: string;
  status: string;
  note?: string;
  reply_note?: string;
  createdAt?: string;
}

/* ──────────────────────────── Constants ──────────────────────────── */

const FILL_STYLE = { fontVariationSettings: "'FILL' 1" } as const;

const ORDER_FILTERS: { id: OrderFilter; label: string }[] = [
  { id: "all", label: "Semua" },
  { id: "pending", label: "Menunggu Bayar" },
  { id: "paid", label: "Dibayar" },
  { id: "processing", label: "Diproses" },
  { id: "shipped", label: "Dikirim" },
  { id: "completed", label: "Selesai" },
  { id: "cancelled", label: "Dibatalkan" },
];

const TIMELINE_STEPS = ["Diterima", "Diproses", "Dikirim", "Terkirim"];

/* ──────────────────────────── Helpers ──────────────────────────── */

function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    UNPAID: "bg-tertiary-container text-on-tertiary-container",
    PAID: "bg-error-container text-error",
    CONFIRM_SELLER: "bg-primary-container text-on-primary-container",
    PROSES_PENGERJAAN: "bg-tertiary-container text-on-tertiary-container",
    CONFIRM_USER: "bg-error-container text-error",
    DELIVERY: "bg-secondary-container text-on-secondary-container",
    DITERIMA: "bg-secondary-container text-secondary",
    PROCESSED: "bg-primary-container text-on-primary-container",
    SHIPPED: "bg-secondary-container text-on-secondary-container",
    DELIVERED: "bg-secondary-container text-secondary",
    COMPLETED: "bg-surface-container text-on-surface-variant",
    CANCELLED: "bg-surface-container-high text-on-surface-variant",
    EXPIRED: "bg-surface-container-high text-on-surface-variant",
  };
  return map[status] || "bg-surface-container text-on-surface-variant";
}

function getTimelineStep(status: string): number {
  const map: Record<string, number> = {
    UNPAID: 0,
    PAID: 1,
    CONFIRM_SELLER: 2,
    PROSES_PENGERJAAN: 2,
    CONFIRM_USER: 2,
    DELIVERY: 3,
    DITERIMA: 4,
    PROCESSED: 2,
    SHIPPED: 3,
    DELIVERED: 4,
    COMPLETED: 4,
    CANCELLED: 0,
    EXPIRED: 0,
  };
  return map[status] ?? 0;
}

function formatRupiah(value: number | null | undefined) {
  if (value == null) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(dateStr: string): string {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

function getImageUrl(path: string | null | undefined): string {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const baseUrl = process.env.NEXT_PUBLIC_ACCESS_FILE_STORAGE || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  return path.startsWith("/") ? `${baseUrl}${path}` : `${baseUrl}/${path}`;
}

/* ──────────────────────────── ProfileSidebar ──────────────────────────── */

function ProfileSidebar() {
  const [akunOpen, setAkunOpen] = useState(false);
  const { user } = useAuth();
  const defaultAvatar =
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBnNFXBawqirwRLnyecSeAd6E2mzFVJEOOXq-W98lx1c_Z7ieclUEvOAvqYH_svhA6fvyPWicVWnYrlsGo6YZRU8J5pR2ZGzyRhLZvJ7rjqHm1xgxZk85d1AOVTLZAnAlOp0m6hD1NalFRswYil1qcxkUpbXKkaq1NYvrE2JNlKiQd1fZVh5s8isV340Js_BP-7444W03IttiJTczSGODFZigsJOesIRPRWBrjbwNwLI36apTgWfECrhT1CJWU55BNsVgYdJuCfn1Q";

  return (
    <aside className="hidden md:block md:w-80 flex-shrink-0">
      <div className="bg-white rounded-2xl p-8 shadow-soft flex flex-col items-center sticky top-24">
        <div className="relative mb-5 group">
          <img
            alt="Avatar"
            className="w-24 h-24 rounded-full object-cover border-4 border-surface-container shadow-md"
            src={user?.avatar || defaultAvatar}
          />
          <button className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full shadow-lg hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-[14px]">edit</span>
          </button>
        </div>
        <h2 className="font-headline text-[22px] font-semibold text-on-surface mb-0.5">
          {user?.name || "Pengguna"}
        </h2>
        <p className="text-[14px] text-on-surface-variant mb-1">Premium Member</p>
        <a href="/profile/account" className="text-[12px] text-primary font-semibold hover:underline mb-4 flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">edit</span>
          Ubah Profil
        </a>
        <a
          href={user?.roles?.includes("seller") ? "/store" : "/store/create"}
          className="w-full py-2.5 bg-secondary text-white rounded-xl text-[13px] font-semibold hover:shadow-float transition-all active:scale-95 flex items-center justify-center gap-2 mb-6"
        >
          <span className="material-symbols-outlined text-[18px]">storefront</span>
          {user?.roles?.includes("seller") ? "Lihat Toko" : "Buat Toko"}
        </a>

        <nav className="w-full space-y-1">
          <button
            onClick={() => setAkunOpen(!akunOpen)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-semibold tracking-[0.05em] text-on-surface-variant hover:bg-surface-container transition-colors w-full text-left"
          >
            <span className="material-symbols-outlined text-[20px]">person</span>
            <span className="flex-1">Akun Saya</span>
            <span className={`material-symbols-outlined text-[18px] text-outline transition-transform ${akunOpen ? "rotate-180" : ""}`}>
              expand_more
            </span>
          </button>

          {akunOpen && (
            <div className="space-y-0.5 pl-8 animate-[fadeIn_0.2s_ease]">
              {[
                { icon: "person", label: "Profil", href: "/profile/account?tab=profile" },
                { icon: "credit_card", label: "Bank & Kartu", href: "/profile/account?tab=bank" },
                { icon: "location_on", label: "Alamat", href: "/profile/account?tab=address" },
                { icon: "lock", label: "Ubah Password", href: "/profile/account?tab=password" },
                { icon: "notifications", label: "Pengaturan Notifikasi", href: "/profile/account?tab=notification" },
                { icon: "shield", label: "Pengaturan Privasi", href: "/profile/account?tab=privacy" },
              ].map((sub) => (
                <a
                  key={sub.label}
                  href={sub.href}
                  className="flex items-center gap-3 px-4 py-2 rounded-xl text-[12px] font-medium text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
                >
                  <span className="material-symbols-outlined text-[17px]">{sub.icon}</span>
                  {sub.label}
                </a>
              ))}
            </div>
          )}

          <a
            href="/profile"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-semibold tracking-[0.05em] bg-primary-container/20 text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]" style={FILL_STYLE}>shopping_bag</span>
            Pesanan Saya
          </a>

          <a href="/coming-soon" className="flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-semibold tracking-[0.05em] text-on-surface-variant hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            Notifikasi
          </a>
          <a href="/coming-soon" className="flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-semibold tracking-[0.05em] text-on-surface-variant hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-[20px]">favorite</span>
            Wishlist
          </a>

          <div className="h-px bg-outline-variant/30 my-4" />

          {[
            { icon: "confirmation_number", label: "Voucher", href: "/coming-soon" },
            { icon: "settings", label: "Pengaturan", href: "/coming-soon" },
          ].map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-semibold tracking-[0.05em] text-on-surface-variant hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">{link.icon}</span>
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </aside>
  );
}

/* ──────────────────────────── OrderTimeline ──────────────────────────── */

function OrderTimeline({ step }: { step: number }) {
  return (
    <div className="flex items-center w-full px-4">
      {TIMELINE_STEPS.map((label, i) => {
        const done = i < step;
        const isLast = i === TIMELINE_STEPS.length - 1;
        return (
          <div key={label} className={`relative flex flex-col items-center ${isLast ? "" : "flex-1"}`}>
            <div
              className={`w-4 h-4 rounded-full z-10 ${
                done ? "bg-secondary ring-4 ring-secondary-container" : "bg-surface-variant"
              }`}
            />
            <span
              className={`text-[10px] mt-2 uppercase text-center ${
                done ? "font-semibold text-secondary" : "font-medium text-on-surface-variant"
              }`}
            >
              {label}
            </span>
            {!isLast && (
              <div
                className={`absolute top-2 left-1/2 w-full h-[2px] ${
                  i < step - 1 ? "bg-secondary" : "bg-surface-variant"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ──────────────────────────── Unpaid QR Code ──────────────────────────── */

function UnpaidQRCode({ orderNumber, createdAt }: { orderNumber: string; createdAt: string }) {
  const [qrData, setQrData] = useState<{ qr_url?: string; qr_string?: string; payment_status?: string; expired_at?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await axios.get(`/api/payment/status/${orderNumber}`, { withCredentials: true });
        if (res.data?.status === "success") {
          setQrData(res.data.data);
        } else {
          setNotFound(true);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, [orderNumber]);

  // Countdown timer — use expired_at from API, fallback to createdAt + 24h
  const expireAt = qrData?.expired_at
    ? new Date(qrData.expired_at)
    : new Date(new Date(createdAt).getTime() + 24 * 3600000);

  useEffect(() => {
    const tick = () => {
      const diff = expireAt.getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft("Waktu habis");
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${h}j ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}d`);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [qrData?.expired_at, createdAt]);

  if (loading) {
    return (
      <span className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-tertiary-container/20 text-[12px] font-medium text-on-tertiary-container">
        <span className="w-3.5 h-3.5 border-2 border-tertiary/30 border-t-tertiary rounded-full animate-spin" />
        Memuat pembayaran...
      </span>
    );
  }

  if (notFound) {
    return (
      <span className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-surface-container-high text-[12px] font-medium text-on-surface-variant">
        <span className="material-symbols-outlined text-[15px]">receipt_long</span>
        Menunggu pembayaran
      </span>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {!showQR ? (
        <button
          onClick={() => setShowQR(true)}
          className="self-start inline-flex items-center gap-2 px-5 py-2.5 bg-tertiary text-on-tertiary rounded-full text-[13px] font-semibold hover:shadow-float transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-[16px]">qr_code</span>
          Bayar Sekarang
          {timeLeft && timeLeft !== "Waktu habis" && (
            <span className="text-[11px] opacity-80">({timeLeft})</span>
          )}
        </button>
      ) : (
        <div className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/20 space-y-4">
          <div className="flex items-center justify-between">
            <h5 className="text-[14px] font-semibold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-tertiary text-[20px]">qr_code</span>
              Pembayaran QRIS
            </h5>
            <button onClick={() => setShowQR(false)} className="text-on-surface-variant hover:text-on-surface">
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          {/* QR Image — clickable to enlarge */}
          {qrData?.qr_url ? (
            <>
              <button onClick={() => setLightboxOpen(true)} className="flex justify-center cursor-pointer group">
                <div className="relative">
                  <img src={qrData.qr_url} alt="QRIS" className="w-48 h-48 rounded-xl border border-outline-variant/20 bg-white p-2 group-hover:shadow-float transition-all" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 rounded-xl transition-all">
                    <span className="material-symbols-outlined text-white opacity-0 group-hover:opacity-100 text-[32px] drop-shadow-lg">zoom_in</span>
                  </div>
                </div>
              </button>
              <QrLightbox qrUrl={qrData.qr_url} isOpen={lightboxOpen} onClose={() => setLightboxOpen(false)} />
            </>
          ) : qrData?.qr_string ? (
            <div className="flex justify-center">
              <pre className="text-[10px] text-on-surface-variant bg-white p-4 rounded-xl border border-outline-variant/20 whitespace-pre-wrap max-w-full break-all">{qrData.qr_string}</pre>
            </div>
          ) : (
            <p className="text-[12px] text-on-surface-variant text-center">QR code tidak tersedia. Silakan coba lagi nanti.</p>
          )}

          <div className="bg-surface-container rounded-xl p-3 text-[11px] text-on-surface-variant space-y-1">
            <p><span className="font-semibold">Order:</span> {orderNumber}</p>
            {timeLeft && (
              <div className="flex items-center gap-2">
                <span className="font-semibold">Sisa waktu:</span>
                <span className={`font-bold ${timeLeft === "Waktu habis" ? "text-error" : "text-tertiary"}`}>
                  {timeLeft}
                </span>
              </div>
            )}
            <p className="text-[10px] mt-2">Scan QR code menggunakan aplikasi e-wallet atau mobile banking kamu.</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────── OrderCard ──────────────────────────── */

function OrderCard({
  order,
  onConfirmImage,
  onRejectImage,
  onConfirmReceived,
  actionLoading,
}: {
  order: UserOrder;
  onConfirmImage: (imageId: number, replyNote?: string) => void;
  onRejectImage: (imageId: number, replyNote?: string) => void;
  onConfirmReceived: (orderId: number) => void;
  actionLoading: boolean;
}) {
  const isFinished = order.status === "COMPLETED" || order.status === "CANCELLED" || order.status === "EXPIRED" || order.status === "DITERIMA";
  const items = order.order_item;
  const firstItem = items[0];
  const totalQty = items.reduce((s, i) => s + i.quantity, 0);
  const timelineStep = getTimelineStep(order.status);
  const images: OrderImageConfirmed[] = order.order_image_confirmed as any[] || [];

  // Reply note state per image
  const [replyNotes, setReplyNotes] = useState<Record<number, string>>({});
  const [confirmingImageId, setConfirmingImageId] = useState<number | null>(null);

  return (
    <div
      className={`bg-white rounded-2xl p-5 md:p-7 shadow-soft border border-outline-variant/10 transition-all duration-300 overflow-hidden ${
        isFinished ? "opacity-80 hover:opacity-100" : "hover:shadow-float hover:-translate-y-1"
      }`}
    >
      {/* Header */}
      <div className="flex flex-row flex-wrap justify-between pb-5 border-b border-outline-variant/20 mb-5 md:mb-7 gap-3 md:gap-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center overflow-hidden border border-outline-variant/10">
            <img
              src={getProductImageUrl(firstItem?.product_id)}
              alt={firstItem?.product_id?.name || "Produk"}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="text-[14px] font-semibold text-on-surface mb-0.5">
              {firstItem?.product_id?.name || "Produk"}
              {items.length > 1 && (
                <span className="text-on-surface-variant font-normal"> +{items.length - 1} lainnya</span>
              )}
            </h3>
            <p className="text-[11px] text-on-surface-variant">{formatDate(order.createdAt)}</p>
          </div>
        </div>
        <div className="flex flex-col items-start lg:items-end shrink-0">
          <span className={`${getStatusColor(order.status)} px-2.5 py-1 rounded-full text-[10px] md:text-[11px] font-bold mb-1 whitespace-nowrap max-w-full`}>
            {getBuyerStatusLabel(order.status)}
          </span>
          <span className="text-[10px] md:text-[11px] text-on-surface-variant">#{order.orderNumber}</span>
        </div>
      </div>

      {/* Body - Items */}
      <div className="flex flex-col md:flex-row gap-7 mb-8">
        <div className="flex-grow space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex gap-3 items-center">
              <div className="w-14 h-14 rounded-xl bg-surface-container flex items-center justify-center flex-shrink-0 overflow-hidden border border-outline-variant/10">
                <img
                  src={getProductImageUrl(item.product_id)}
                  alt={item.product_id?.name || "Produk"}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-on-surface truncate">
                  {item.product_id?.name || "Produk"}
                </p>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {item.product_variant_id && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-primary-container/20 text-[10px] font-medium text-on-primary-container">
                      {item.product_variant_id.title} — {item.product_variant_id.subTitle}
                    </span>
                  )}
                  {item.addon_product != null && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-secondary-container/30 text-[10px] font-medium text-on-secondary-container">
                      + Addon
                    </span>
                  )}
                </div>
                {item.store_id?.name && (
                  <p className="text-[11px] text-on-surface-variant mt-0.5">{item.store_id.name}</p>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-[12px] font-semibold text-on-surface">
                  {formatRupiah(item.price)}
                </p>
                <p className="text-[10px] text-on-surface-variant">×{item.quantity}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Price Summary */}
        <div className="w-full md:w-56 bg-surface-container-low rounded-2xl p-5 flex-shrink-0">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-[11px] text-on-surface-variant">
              <span>Items ({totalQty})</span>
              <span>{formatRupiah(order.items_total)}</span>
            </div>
            <div className="flex justify-between text-[11px] text-on-surface-variant">
              <span>Ongkir</span>
              <span>{formatRupiah(order.shipping_total)}</span>
            </div>
            <div className="flex justify-between text-[11px] text-on-surface-variant">
              <span>Biaya Layanan</span>
              <span>{formatRupiah(deriveServiceFee(order))}</span>
            </div>
            {order.discount != null && order.discount > 0 && (
              <div className="flex justify-between text-[11px] text-secondary">
                <span>Diskon</span>
                <span>-{formatRupiah(order.discount)}</span>
              </div>
            )}
            <div className="h-px bg-outline-variant/20 my-2" />
            <div className="flex justify-between text-[13px] font-semibold text-on-surface">
              <span>Total</span>
              <span className="text-primary">{formatRupiah(order.total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      {!isFinished && (
        <div className="border-t border-outline-variant/10 pt-8 mb-6">
          <h5 className="text-[13px] font-semibold text-on-surface mb-5 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[18px]">timeline</span>
            Status Pesanan
          </h5>
          <OrderTimeline step={timelineStep} />
        </div>
      )}

      {/* Seller Images (order_image_confirmed) */}
      {images.length > 0 && (
        <div className="border-t border-outline-variant/10 pt-6 mb-6">
          <h5 className="text-[13px] font-semibold text-on-surface mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[18px]">photo_library</span>
            Foto Buket dari Penjual
          </h5>
          <div className="flex flex-wrap gap-4">
            {images.map((img) => {
              const isPending = img.status === "PENDING";
              const isProcessing = confirmingImageId === img.id;
              return (
                <div key={img.id} className="flex flex-col gap-3 p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/10 min-w-[200px]">
                  {/* Image */}
                  <div className="w-full aspect-square rounded-xl overflow-hidden bg-surface-container border border-outline-variant/20">
                    <img
                      src={getImageUrl(img.image_url)}
                      alt="Foto Buket"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "";
                        (e.target as HTMLImageElement).classList.add("hidden");
                      }}
                    />
                  </div>

                  {/* Seller Note */}
                  {img.note && (
                    <p className="text-[11px] text-on-surface-variant">
                      <span className="font-semibold">Catatan penjual:</span> {img.note}
                    </p>
                  )}

                  {/* Reply Note */}
                  {img.reply_note && (
                    <p className="text-[11px] text-on-surface-variant">
                      <span className="font-semibold">Balasan kamu:</span> {img.reply_note}
                    </p>
                  )}

                  {/* Action or Status */}
                  {isPending ? (
                    <div className="space-y-2">
                      {/* Reply note input */}
                      <textarea
                        placeholder="Catatan untuk penjual (opsional)..."
                        value={replyNotes[img.id] || ""}
                        onChange={(e) =>
                          setReplyNotes((prev) => ({ ...prev, [img.id]: e.target.value }))
                        }
                        disabled={actionLoading || isProcessing}
                        className="w-full px-3 py-2 bg-surface-container border border-outline-variant/30 rounded-lg text-[12px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none disabled:opacity-50"
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <button
                          disabled={actionLoading || isProcessing}
                          onClick={() => {
                            setConfirmingImageId(img.id);
                            onConfirmImage(img.id, replyNotes[img.id]);
                          }}
                          className="flex-1 px-3 py-2 bg-secondary text-white rounded-full text-[11px] font-semibold hover:shadow-sm transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1"
                        >
                          {isProcessing ? (
                            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <span className="material-symbols-outlined text-[14px]">check</span>
                          )}
                          Setuju
                        </button>
                        <button
                          disabled={actionLoading || isProcessing}
                          onClick={() => {
                            setConfirmingImageId(img.id);
                            onRejectImage(img.id, replyNotes[img.id]);
                          }}
                          className="px-3 py-2 border border-error/40 text-error rounded-full text-[11px] font-semibold hover:bg-error-container/20 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[14px]">close</span>
                          Tolak
                        </button>
                      </div>
                    </div>
                  ) : (
                    <span
                      className={`self-start px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        img.status === "CONFIRMED"
                          ? "bg-secondary-container text-secondary"
                          : "bg-error-container text-error"
                      }`}
                    >
                      {img.status === "CONFIRMED" ? "Disetujui" : "Ditolak"}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 border-t border-outline-variant/10 pt-6">
        {/* UNPAID — show QRIS for payment */}
        {order.status === "UNPAID" && (
          <UnpaidQRCode orderNumber={order.orderNumber} createdAt={order.createdAt} />
        )}

        {/* PAID — waiting seller confirmation */}
        {order.status === "PAID" && (
          <span className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-secondary-container/20 text-[12px] font-medium text-secondary">
            <span className="material-symbols-outlined text-[15px]" style={FILL_STYLE}>verified</span>
            Pembayaran terverifikasi
          </span>
        )}

        {/* CONFIRM_SELLER / PROSES_PENGERJAAN — seller is working */}
        {(order.status === "CONFIRM_SELLER" || order.status === "PROSES_PENGERJAAN") && (
          <span className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-primary-container/20 text-[12px] font-medium text-on-primary-container">
            <span className="material-symbols-outlined text-[15px]">handyman</span>
            Sedang dibuat oleh penjual
          </span>
        )}

        {/* CONFIRM_USER — waiting buyer image confirmation */}
        {order.status === "CONFIRM_USER" && (
          <span className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-error-container/20 text-[12px] font-medium text-error">
            <span className="material-symbols-outlined text-[15px]">image</span>
            Menunggu konfirmasi foto buket
          </span>
        )}

        {/* DELIVERY — confirm received */}
        {order.status === "DELIVERY" && (
          <button
            onClick={() => onConfirmReceived(order.id)}
            disabled={actionLoading}
            className="px-5 py-2.5 bg-secondary text-white rounded-full text-[13px] font-semibold hover:shadow-float transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
          >
            {actionLoading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                Pesanan Diterima
              </>
            )}
          </button>
        )}

        {/* Completed / DITERIMA — re-order */}
        {(order.status === "COMPLETED" || order.status === "DITERIMA") && (
          <Link
            href="/"
            className="px-5 py-2.5 bg-secondary text-white rounded-full text-[13px] font-semibold hover:shadow-float transition-all active:scale-95"
          >
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">refresh</span>
              Pesan Lagi
            </span>
          </Link>
        )}
      </div>
    </div>
  );
}

/* ──────────────────────────── Page ──────────────────────────── */

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const [activeFilter, setActiveFilter] = useState<OrderFilter>("all");
  const [search, setSearch] = useState("");
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getBuyerOrders();
      if (res.status === "success") {
        setOrders(res.data ?? []);
      } else {
        setError(res.message || "Gagal memuat pesanan");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Gagal memuat pesanan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchOrders();
  }, [user]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  /* ── Confirm / Reject Seller Image ── */

  const handleConfirmImage = async (imageId: number, replyNote?: string) => {
    setActionError(null);
    setActionLoading(true);
    try {
      const res = await confirmOrderImage(imageId, {
        status: "CONFIRMED",
        ...(replyNote ? { reply_note: replyNote } : {}),
      });
      if (res.status === "success") {
        await fetchOrders();
      } else {
        setActionError(res.message || "Gagal mengkonfirmasi gambar");
      }
    } catch (err: any) {
      setActionError(err.response?.data?.message || err.message || "Gagal mengkonfirmasi gambar");
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmReceived = async (orderId: number) => {
    setActionError(null);
    setActionLoading(true);
    try {
      const res = await confirmReceived(orderId);
      if (res.status === "success") {
        await fetchOrders();
      } else {
        setActionError(res.message || "Gagal mengkonfirmasi");
      }
    } catch (err: any) {
      setActionError(err.response?.data?.message || err.message || "Gagal mengkonfirmasi");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectImage = async (imageId: number, replyNote?: string) => {
    setActionError(null);
    setActionLoading(true);
    try {
      const res = await confirmOrderImage(imageId, {
        status: "REJECTED",
        ...(replyNote ? { reply_note: replyNote } : {}),
      });
      if (res.status === "success") {
        await fetchOrders();
      } else {
        setActionError(res.message || "Gagal menolak gambar");
      }
    } catch (err: any) {
      setActionError(err.response?.data?.message || err.message || "Gagal menolak gambar");
    } finally {
      setActionLoading(false);
    }
  };

  /* ── Filter & Search ── */

  const filteredOrders = orders.filter((o) => {
    if (activeFilter !== "all") {
      const filterKey = getBuyerFilterKey(o.status);
      if (filterKey !== activeFilter) return false;
    }
    if (search) {
      const q = search.toLowerCase();
      const matchesOrder = o.orderNumber.toLowerCase().includes(q);
      const matchesProduct = o.order_item.some((item) =>
        item.product_id?.name?.toLowerCase().includes(q)
      );
      if (!matchesOrder && !matchesProduct) return false;
    }
    return true;
  });

  return (
    <main className="pt-8 pb-20 md:pb-16 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <ProfileSidebar />

        {/* Content */}
        <section className="flex-grow min-w-0">
          {/* Mobile account bar */}
          <div className="md:hidden flex items-center justify-between bg-white rounded-2xl p-4 shadow-soft border border-outline-variant/20 mb-6">
            <div className="flex items-center gap-3">
              <img
                src={user?.avatar || "https://ui-avatars.com/api/?name=User&background=8c4a5c&color=fff"}
                alt="Avatar"
                className="w-10 h-10 rounded-full object-cover border-2 border-primary/20"
              />
              <div>
                <p className="text-[14px] font-semibold text-on-surface">{user?.name || "Pengguna"}</p>
                <p className="text-[11px] text-on-surface-variant">{user?.email || ""}</p>
              </div>
            </div>
            <Link
              href="/profile/account"
              className="px-4 py-2 bg-primary text-white rounded-xl text-[12px] font-semibold hover:shadow-soft transition-all active:scale-95 flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">settings</span>
              Akun
            </Link>
          </div>

          {/* Header */}
          <div className="mb-10">
            <h1 className="font-headline text-[28px] md:text-[36px] leading-[44px] font-semibold text-on-surface mb-6">
              Pesanan Saya
            </h1>

            {/* Filter tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 w-full">
              {ORDER_FILTERS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id)}
                  className={`px-5 py-2 rounded-full text-[13px] font-semibold tracking-[0.05em] whitespace-nowrap transition-all ${
                    activeFilter === f.id
                      ? "bg-primary text-white shadow-soft"
                      : "bg-white text-on-surface-variant hover:bg-surface-container"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="mt-6 relative">
              <input
                className="w-full bg-white border border-outline-variant/30 rounded-xl px-12 py-3.5 focus:ring-2 focus:ring-primary/20 text-[14px] transition-all"
                placeholder="Cari berdasarkan nama produk atau nomor pesanan..."
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
                search
              </span>
            </div>
          </div>

          {/* Error banner */}
          {(error || actionError) && (
            <div className="mb-6 flex items-center gap-2 p-4 rounded-xl bg-error-container/20 border border-error/20 text-[13px] text-error font-medium animate-[fadeIn_0.3s_ease]">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {actionError || error}
              <button onClick={() => { setActionError(null); setError(null); }} className="ml-auto">
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <span className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              <p className="text-[14px] text-on-surface-variant">Memuat pesanan...</p>
            </div>
          )}

          {/* Orders */}
          {!loading && (
            <div className="space-y-6">
              {filteredOrders.length === 0 ? (
                <div className="text-center py-20">
                  <span className="material-symbols-outlined text-[48px] text-outline-variant/40 mb-4 block">
                    shopping_bag
                  </span>
                  <h3 className="text-[16px] font-semibold text-on-surface mb-1">Belum Ada Pesanan</h3>
                  <p className="text-[13px] text-on-surface-variant mb-6">
                    {activeFilter !== "all"
                      ? "Tidak ada pesanan dengan filter ini."
                      : "Yuk mulai belanja bunga favoritmu!"}
                  </p>
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl text-[13px] font-semibold hover:shadow-float transition-all"
                  >
                    <span className="material-symbols-outlined text-[16px]">storefront</span>
                    Jelajahi Produk
                  </Link>
                </div>
              ) : (
                filteredOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onConfirmImage={handleConfirmImage}
                    onRejectImage={handleRejectImage}
                    onConfirmReceived={handleConfirmReceived}
                    actionLoading={actionLoading}
                  />
                ))
              )}
            </div>
          )}

        </section>
      </div>
    </main>
  );
}
