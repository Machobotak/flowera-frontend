"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { getBuyerOrders, confirmOrderImage } from "@/utils/user-order-api";
import { getBuyerStatusLabel, getBuyerFilterKey, deriveServiceFee } from "@/utils/order-utils";
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

const CUSTOM_DESIGNS = [
  {
    name: "Cerulean Dream",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA3XYNUhZ4WnpvFOutAY4dlc2WBbt6KzIy2isyupHSLQH2y6yEww7IoyUP4eGq4g7WSf3yQRhTsZ6HuiFVZI83N-ASSV3Plb8C37IErueMu5a5Po0vuc2Swim2o26W6qTvRNtUal-0FzTw1IgfSSrSMd-kTTEbNWivov5lAQUeP0-LTENVlG60rDYotQWghJ87eyPp766N6MzasyDgI3QIW08gctR7s2YLHAWAs1n0GfLXEq4IFDz22FOuRJAzn2iu8f4wEwyGe_GI",
  },
  {
    name: "Golden Harvest",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAswWl7d19Or8YzhC_zzOZpWA5vmfmXWIQJgdU_BzljyKzTf8N8p2dzHOBE2JQQLWzQY19KQUx4oB84fti3_W4SXKSiWcpY_hfif1xyTdM8U8mB9wyhuifXeA4nyYyYLO1D3K6P-Z6DHLpl3fjLPfSDspZhdC7pzq85Mqsa3d0l7Fu_LbzJsDobBYJD8PNQ-N0K5FCKzmceo2VHO-YXIf9sCnuEZBvxx8bPEe-FS0b84ITXcPQyMEnjPtzSFrio2YnyOmPOk-1ZYO8",
  },
  {
    name: "Solitary Grace",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBThUBvcGn7Mk_2JGMtfCCzsEs3K0jg7K0LxDkqkPWaLCJvYTFpFkQ1pqt02A9GuCukQC9G35sZ5WN3pxAe8LKz6T80J1yyHeG9GIFTri1u3Z2DhYQjMrngJ4OMO2FCFMTs8unBimO7ZxKjvCI4SxXvqn-KNqRLiXKdM-Ek-hrh23qJAZ0FqxVjvbrMlQuRUecPgf14OL2jhZge4ZEey3zVTFt-9-JvhksTXt80ijjpOMyfq9dIaSIsTEhbgi6pH2AfDFamkODkeis",
  },
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
    <aside className="w-full md:w-80 flex-shrink-0">
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

          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-semibold tracking-[0.05em] text-on-surface-variant hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            Notifikasi
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-semibold tracking-[0.05em] text-on-surface-variant hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-[20px]">favorite</span>
            Wishlist
          </a>

          <div className="h-px bg-outline-variant/30 my-4" />

          {[
            { icon: "confirmation_number", label: "Voucher", href: "#" },
            { icon: "settings", label: "Pengaturan", href: "#" },
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

/* ──────────────────────────── OrderCard ──────────────────────────── */

function OrderCard({
  order,
  onConfirmImage,
  onRejectImage,
  actionLoading,
}: {
  order: UserOrder;
  onConfirmImage: (imageId: number, replyNote?: string) => void;
  onRejectImage: (imageId: number, replyNote?: string) => void;
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
      className={`bg-white rounded-2xl p-7 shadow-soft border border-outline-variant/10 transition-all duration-300 ${
        isFinished ? "opacity-80 hover:opacity-100" : "hover:shadow-float hover:-translate-y-1"
      }`}
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between pb-5 border-b border-outline-variant/20 mb-7 gap-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-secondary-container flex items-center justify-center overflow-hidden">
            <span className="material-symbols-outlined text-secondary text-[24px]" style={FILL_STYLE}>
              shopping_bag
            </span>
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
        <div className="flex flex-col items-start lg:items-end">
          <span className={`${getStatusColor(order.status)} px-3 py-1 rounded-full text-[11px] font-bold mb-1`}>
            {getBuyerStatusLabel(order.status)}
          </span>
          <span className="text-[11px] text-on-surface-variant">#{order.orderNumber}</span>
        </div>
      </div>

      {/* Body - Items */}
      <div className="flex flex-col md:flex-row gap-7 mb-8">
        <div className="flex-grow space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex gap-3 items-center">
              <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center flex-shrink-0 overflow-hidden">
                <span className="material-symbols-outlined text-on-surface-variant text-[20px]">local_florist</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-on-surface truncate">
                  {item.product_id?.name || "Produk"}
                </p>
                <p className="text-[11px] text-on-surface-variant truncate">
                  {item.product_variant_id
                    ? `${item.product_variant_id.title} — ${item.product_variant_id.subTitle}`
                    : ""}
                  {item.store_id?.name ? ` • ${item.store_id.name}` : ""}
                </p>
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
        {/* UNPAID — no action needed (payment handled elsewhere) */}
        {order.status === "UNPAID" && (
          <span className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-tertiary-container/20 text-[12px] font-medium text-on-tertiary-container">
            <span className="material-symbols-outlined text-[15px]">schedule</span>
            Menunggu pembayaran
          </span>
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

        {/* DELIVERY — order in transit */}
        {order.status === "DELIVERY" && (
          <span className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-secondary-container/20 text-[12px] font-medium text-secondary">
            <span className="material-symbols-outlined text-[15px]">local_shipping</span>
            Dalam pengiriman
          </span>
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
    fetchOrders();
  }, []);

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
    <main className="pt-8 pb-16 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <ProfileSidebar />

        {/* Content */}
        <section className="flex-grow min-w-0">
          {/* Header */}
          <div className="mb-10">
            <h1 className="font-headline text-[36px] leading-[44px] font-semibold text-on-surface mb-6">
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
                    actionLoading={actionLoading}
                  />
                ))
              )}
            </div>
          )}

          {/* Custom Bouquet History */}
          <div className="mt-14">
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-headline text-[24px] font-semibold text-on-surface">
                Custom Bouquet History
              </h2>
              <button className="text-primary font-semibold text-[13px] hover:underline">
                View All
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {CUSTOM_DESIGNS.map((design) => (
                <div key={design.name} className="group">
                  <div className="aspect-square bg-white rounded-2xl overflow-hidden mb-3 relative shadow-soft">
                    <img
                      alt={design.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      src={design.image}
                    />
                    <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button className="bg-white p-2 rounded-full text-primary hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-[18px]">refresh</span>
                      </button>
                      <button className="bg-white p-2 rounded-full text-primary hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-[18px]" style={FILL_STYLE}>content_copy</span>
                      </button>
                    </div>
                  </div>
                  <h3 className="text-[13px] font-semibold text-center text-on-surface">{design.name}</h3>
                </div>
              ))}
              <div className="group">
                <div className="aspect-square bg-white border-2 border-dashed border-outline-variant/50 rounded-2xl mb-3 flex flex-col items-center justify-center gap-2 text-on-surface-variant hover:border-primary hover:text-primary transition-all cursor-pointer">
                  <span className="material-symbols-outlined text-[36px]">add_circle</span>
                  <span className="text-[13px] font-semibold">New Design</span>
                </div>
                <h3 className="text-[13px] font-semibold text-center text-transparent select-none">Hidden</h3>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
