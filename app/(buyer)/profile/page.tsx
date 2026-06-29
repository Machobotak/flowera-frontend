"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import axios from "axios";
import { useAuth } from "@/contexts/auth-context";
import { resolveImageUrl, getProductImageUrl } from "@/utils/image-url";

/* ──────────────────────────── Types ──────────────────────────── */

type OrderFilter = "all" | "pending" | "paid" | "processing" | "shipped" | "completed" | "cancelled";

interface SidebarLink {
  icon: string;
  label: string;
  href: string;
  active?: boolean;
  filled?: boolean;
}

/* ──────────────────────────── Constants ──────────────────────────── */

const FILL_STYLE = { fontVariationSettings: "'FILL' 1" } as const;

const USER = {
  name: "Eleanor Vance",
  label: "Premium Member",
  avatar:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBnNFXBawqirwRLnyecSeAd6E2mzFVJEOOXq-W98lx1c_Z7ieclUEvOAvqYH_svhA6fvyPWicVWnYrlsGo6YZRU8J5pR2ZGzyRhLZvJ7rjqHm1xgxZk85d1AOVTLZAnAlOp0m6hD1NalFRswYil1qcxkUpbXKkaq1NYvrE2JNlKiQd1fZVh5s8isV340Js_BP-7444W03IttiJTczSGODFZigsJOesIRPRWBrjbwNwLI36apTgWfECrhT1CJWU55BNsVgYdJuCfn1Q",
};

const SIDEBAR_LINKS: SidebarLink[] = [
  { icon: "person", label: "Akun Saya", href: "/profile/account" },
  { icon: "shopping_bag", label: "Pesanan Saya", href: "/profile", active: true, filled: true },
  { icon: "notifications", label: "Notifikasi", href: "#" },
  { icon: "favorite", label: "Wishlist", href: "#" },
];

const SIDEBAR_LINKS_BOTTOM: SidebarLink[] = [
  { icon: "confirmation_number", label: "Voucher", href: "#" },
  { icon: "settings", label: "Pengaturan", href: "#" },
];

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

const TIMELINE_STEPS = ["Received", "Arranging", "In Transit", "Delivered"];

/* ──────────────── Status helpers ──────────────── */

function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    pending: "Menunggu Pembayaran",
    paid: "Sudah Dibayar",
    processing: "Sedang Diproses",
    shipped: "Dalam Pengiriman",
    completed: "Selesai",
    cancelled: "Dibatalkan",
  };
  return map[status] || status;
}

function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    pending: "bg-tertiary-container text-on-tertiary-container",
    paid: "bg-secondary-container text-on-secondary-container",
    processing: "bg-primary-container text-on-primary-container",
    shipped: "bg-secondary-container text-on-secondary-container",
    completed: "bg-surface-container text-on-surface-variant",
    cancelled: "bg-error-container text-on-error-container",
  };
  return map[status] || "bg-surface-container text-on-surface-variant";
}

function getTimelineStep(status: string): number {
  const map: Record<string, number> = {
    pending: 0,
    paid: 1,
    processing: 2,
    shipped: 3,
    completed: 4,
    cancelled: 0,
  };
  return map[status] ?? 0;
}

function formatRupiah(value: number) {
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

/* ──────────────────────────── Sub-components ──────────────────────────── */

function ProfileSidebar() {
  const [akunOpen, setAkunOpen] = useState(false);
  const { user } = useAuth();

  return (
    <aside className="w-full md:w-80 flex-shrink-0">
      <div className="bg-white rounded-2xl p-8 shadow-soft flex flex-col items-center sticky top-24">
        {/* Avatar */}
        <div className="relative mb-5 group">
          <img
            alt="Avatar"
            className="w-24 h-24 rounded-full object-cover border-4 border-surface-container shadow-md"
            src={user?.avatar || USER.avatar}
          />
          <button className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full shadow-lg hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-[14px]">edit</span>
          </button>
        </div>
        <h2 className="font-headline text-[22px] font-semibold text-on-surface mb-0.5">{user?.name || USER.name}</h2>
        <p className="text-[14px] text-on-surface-variant mb-1">{user?.memberLabel || USER.label}</p>
        <a href="/profile/account" className="text-[12px] text-primary font-semibold hover:underline mb-4 flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">edit</span>
          Ubah Profil
        </a>
        <a href={user?.roles?.includes("seller") ? "/store" : "/store/create"} className="w-full py-2.5 bg-secondary text-white rounded-xl text-[13px] font-semibold hover:shadow-float transition-all active:scale-95 flex items-center justify-center gap-2 mb-6">
          <span className="material-symbols-outlined text-[18px]">storefront</span>
          {user?.roles?.includes("seller") ? "Lihat Toko" : "Buat Toko"}
        </a>

        {/* Nav links */}
        <nav className="w-full space-y-1">
          {/* Akun Saya — toggle sub-menu */}
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

          {/* Sub-menu — only visible when toggled */}
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

          {/* Pesanan Saya */}
          <a
            href="/profile"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-semibold tracking-[0.05em] bg-primary-container/20 text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]" style={FILL_STYLE}>shopping_bag</span>
            Pesanan Saya
          </a>

          {/* Other links */}
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-semibold tracking-[0.05em] text-on-surface-variant hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            Notifikasi
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-semibold tracking-[0.05em] text-on-surface-variant hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-[20px]">favorite</span>
            Wishlist
          </a>

          <div className="h-px bg-outline-variant/30 my-4" />

          {SIDEBAR_LINKS_BOTTOM.map((link) => (
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

function OrderCard({
  order,
  onCancel,
  onConfirm,
  onUploadProof,
  actionLoading,
}: {
  order: any;
  onCancel: (id: number) => void;
  onConfirm: (id: number) => void;
  onUploadProof: (id: number) => void;
  actionLoading: boolean;
}) {

  const isFinished = order.status === "completed" || order.status === "cancelled";
  // const firstItem = order.items?.[0];
  // const productName = firstItem?.product?.name || "Produk";
  // const totalQty = order.items.reduce((s: number, i: any) => s + i.quantity, 0);
  const timelineStep = getTimelineStep(order.status);

const items = order.order_item ?? [];

const firstItem = items[0];

const productName = firstItem?.product_id?.name ?? "Produk";

const totalQty = items.reduce(
  (sum: number, item: any) => sum + item.quantity,
  0
);

  return (
    <div className={`bg-white rounded-2xl p-7 shadow-soft border border-outline-variant/10 transition-all duration-300 ${
      isFinished ? "opacity-80 hover:opacity-100" : "hover:shadow-float hover:-translate-y-1"
    }`}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between pb-5 border-b border-outline-variant/20 mb-7 gap-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-secondary-container flex items-center justify-center overflow-hidden">
            <span className="material-symbols-outlined text-secondary text-[24px]" style={FILL_STYLE}>shopping_bag</span>
          </div>
          <div>
            <h3 className="text-[14px] font-semibold text-on-surface mb-0.5">
              {productName}
              {order.order_item.length > 1 && (
                <span className="text-on-surface-variant font-normal"> +{order.order_item.length - 1} lainnya</span>
              )}
            </h3>
            <p className="text-[11px] text-on-surface-variant">{formatDate(order.createdAt)}</p>
          </div>
        </div>
        <div className="flex flex-col items-start lg:items-end">
          <span className={`${getStatusColor(order.status)} px-3 py-1 rounded-full text-[11px] font-bold mb-1`}>
            {getStatusLabel(order.status)}
          </span>
          <span className="text-[11px] text-on-surface-variant">Order #{order.orderNumber}</span>
        </div>
      </div>

      {/* Body - Items */}
      <div className="flex flex-col md:flex-row gap-7 mb-8">
        <div className="flex-grow space-y-3">
          {order.order_item.map((item: any) => (
            <div key={item.id} className="flex gap-3 items-center">
              <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center flex-shrink-0 overflow-hidden">
                {item.product ? (
                  <img
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                    src={getProductImageUrl(item.product)}
                  />
                ) : (
                  <span className="material-symbols-outlined text-on-surface-variant text-[20px]">local_florist</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-on-surface truncate">{item.product?.name || "Produk"}</p>
                <p className="text-[11px] text-on-surface-variant">
                  {item.variant ? item.variant.title : ""}
                  {item.addon_product ? ` • ${item.addon_product}` : ""}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-[12px] font-semibold text-on-surface">
                  {formatRupiah(item.variant?.price || item.product?.price || 0)}
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
              <span>{formatRupiah(order.total + Number(order.discount || 0))}</span>
            </div>
            {Number(order.discount) > 0 && (
              <div className="flex justify-between text-[11px] text-secondary">
                <span>Diskon</span>
                <span>-{formatRupiah(Number(order.discount))}</span>
              </div>
            )}
            <div className="h-px bg-outline-variant/20 my-2" />
            <div className="flex justify-between text-[13px] font-semibold text-on-surface">
              <span>Total</span>
              <span className="text-primary">{formatRupiah(order.total)}</span>
            </div>
          </div>
          {order.payment && (
            <p className="text-[11px] text-on-surface-variant text-center">
              via {order.payment.payment_method.toUpperCase()}
            </p>
          )}
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

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 border-t border-outline-variant/10 pt-6">
        {/* Cancel — only when pending */}
        {order.status === "pending" && (
          <button
            disabled={actionLoading}
            onClick={() => onCancel(order.id)}
            className="px-5 py-2.5 border border-error/40 text-error rounded-full text-[13px] font-semibold hover:bg-error-container/20 transition-all active:scale-95 disabled:opacity-50"
          >
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">close</span>
              Batalkan Pesanan
            </span>
          </button>
        )}

        {/* Upload Proof — when pending or paid (re-upload) */}
        {(order.status === "pending" || order.status === "paid") && (
          <button
            disabled={actionLoading}
            onClick={() => onUploadProof(order.id)}
            className="px-5 py-2.5 bg-primary text-white rounded-full text-[13px] font-semibold hover:shadow-float transition-all active:scale-95 disabled:opacity-50"
          >
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">upload</span>
              {order.paymentProof ? "Upload Ulang Bukti" : "Upload Bukti Bayar"}
            </span>
          </button>
        )}

        {/* Confirm received — when shipped */}
        {order.status === "shipped" && order.isCustomerConfirmed !== "true" && (
          <button
            disabled={actionLoading}
            onClick={() => onConfirm(order.id)}
            className="px-5 py-2.5 bg-secondary text-white rounded-full text-[13px] font-semibold hover:shadow-float transition-all active:scale-95 disabled:opacity-50"
          >
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              Pesanan Diterima
            </span>
          </button>
        )}

        {/* Completed — re-order */}
        {order.status === "completed" && (
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

        {/* Payment proof indicator */}
        {order.paymentProof && (
          <span className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-secondary-container/20 text-[12px] font-medium text-secondary">
            <span className="material-symbols-outlined text-[15px]" style={FILL_STYLE}>verified</span>
            Bukti bayar terkirim
          </span>
        )}
      </div>
    </div>
  );
}

/* ── Payment Proof Upload Modal ── */

function PaymentProofModal({
  orderId,
  onClose,
  onSubmit,
  isSubmitting,
}: {
  orderId: number;
  onClose: () => void;
  onSubmit: (file: File, note?: string) => void;
  isSubmitting: boolean;
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease]">
      <div className="bg-white rounded-2xl shadow-float w-full max-w-md mx-4 p-6 animate-[slideUp_0.3s_ease]">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[16px] font-semibold text-on-surface">Upload Bukti Pembayaran</h3>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        {/* File picker */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-outline-variant/40 rounded-xl p-6 text-center cursor-pointer hover:border-primary/60 transition-colors mb-4"
        >
          {preview ? (
            <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-lg object-contain" />
          ) : (
            <div className="space-y-2">
              <span className="material-symbols-outlined text-[36px] text-on-surface-variant">cloud_upload</span>
              <p className="text-[13px] text-on-surface-variant">Klik untuk pilih gambar bukti transfer</p>
              <p className="text-[11px] text-outline">JPG, PNG, atau WebP (maks. 5MB)</p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* Note */}
        <div className="space-y-1.5 mb-5">
          <label className="text-[12px] font-semibold text-on-surface-variant">Catatan <span className="font-normal text-outline">(opsional)</span></label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Mis: Transfer dari BCA a.n. John"
            className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[13px] font-body focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-outline-variant/40 rounded-xl text-[13px] font-semibold text-on-surface-variant hover:bg-surface-container-high transition-all"
          >
            Batal
          </button>
          <button
            disabled={!selectedFile || isSubmitting}
            onClick={() => selectedFile && onSubmit(selectedFile, note || undefined)}
            className="flex-1 px-4 py-3 bg-primary text-white rounded-xl text-[13px] font-semibold hover:shadow-float transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Mengirim...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">send</span>
                Kirim Bukti
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────── Page ──────────────────────────── */

export default function ProfilePage() {
  const [activeFilter, setActiveFilter] = useState<OrderFilter>("all");
  const [search, setSearch] = useState("");
  const [uploadModalOrderId, setUploadModalOrderId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("/api/user/order", { withCredentials: true });
      if (res.data?.status === "success") {
        setOrders(res.data.data ?? []);
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

  /* ── Handlers ── */

  const handleCancel = async (id: number) => {
    if (!confirm("Apakah kamu yakin ingin membatalkan pesanan ini?")) return;
    setActionError(null);
    setActionLoading(true);
    try {
      await axios.patch(`/api/user/orders/${id}/cancel`, {}, { withCredentials: true });
      await fetchOrders();
    } catch (err: any) {
      setActionError(err.response?.data?.message || err.message || "Gagal membatalkan pesanan");
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirm = async (id: number) => {
    if (!confirm("Konfirmasi bahwa pesanan sudah diterima dengan baik?")) return;
    setActionError(null);
    setActionLoading(true);
    try {
      await axios.patch(`/api/user/orders/${id}/confirm`, {}, { withCredentials: true });
      await fetchOrders();
    } catch (err: any) {
      setActionError(err.response?.data?.message || err.message || "Gagal mengkonfirmasi pesanan");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUploadProof = async (file: File, note?: string) => {
    if (!uploadModalOrderId) return;
    setActionError(null);
    setActionLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      if (note) formData.append("note", note);
      await axios.post(`/api/user/orders/${uploadModalOrderId}/payment-proof`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchOrders();
      setUploadModalOrderId(null);
    } catch (err: any) {
      setActionError(err.response?.data?.message || err.message || "Gagal mengupload bukti pembayaran");
    } finally {
      setActionLoading(false);
    }
  };

  /* ── Filter & Search ── */

  const filteredOrders = orders.filter((o) => {
    if (activeFilter !== "all" && o.status !== activeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchesOrder = o.orderNumber.toLowerCase().includes(q);
      const matchesProduct = o.items.some(
        (item: any) => item.product?.name.toLowerCase().includes(q)
      );
      return matchesOrder || matchesProduct;
    }
    return true;
  });

  return (
    <main className="pt-8 pb-16 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto min-h-screen">
      {/* Payment Proof Upload Modal */}
      {uploadModalOrderId && (
        <PaymentProofModal
          orderId={uploadModalOrderId}
          onClose={() => setUploadModalOrderId(null)}
          onSubmit={handleUploadProof}
          isSubmitting={actionLoading}
        />
      )}

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
              <button onClick={() => setActionError(null)} className="ml-auto">
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
                  <span className="material-symbols-outlined text-[48px] text-outline-variant/40 mb-4 block">shopping_bag</span>
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
                    onCancel={handleCancel}
                    onConfirm={handleConfirm}
                    onUploadProof={(id) => setUploadModalOrderId(id)}
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
              {/* New Design card */}
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