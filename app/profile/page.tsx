"use client";

import React, { useState } from "react";
import Link from "next/link";

/* ──────────────────────────── Types ──────────────────────────── */

type OrderFilter = "all" | "waiting" | "preparing" | "delivery" | "delivered" | "cancelled" | "custom";

interface SidebarLink {
  icon: string;
  label: string;
  href: string;
  active?: boolean;
  filled?: boolean;
}

interface OrderItem {
  id: string;
  orderId: string;
  status: string;
  statusColor: string;
  floristName: string;
  floristImage: string;
  bouquetName: string;
  bouquetImage: string;
  details: string;
  recipient: string;
  delivery: string;
  qty: number;
  subtotal: string;
  deliveryCost: string;
  total: string;
  timelineStep: number;
  progressImages?: string[];
  isPast?: boolean;
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
  { id: "all", label: "All" },
  { id: "waiting", label: "Waiting Payment" },
  { id: "preparing", label: "Preparing" },
  { id: "delivery", label: "In Delivery" },
  { id: "delivered", label: "Delivered" },
  { id: "cancelled", label: "Cancelled" },
  { id: "custom", label: "Custom Requests" },
];

const ORDERS: OrderItem[] = [
  {
    id: "1",
    orderId: "#FLW-92841-B",
    status: "Being Arranged",
    statusColor: "bg-secondary-container text-on-secondary-container",
    floristName: "The Velvet Rose Atelier",
    floristImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCj3keEyPP7WBbJLkO-Y8tYoIC5reF2gMaAII9bAS1Rf14BkAwgNcnPkqv3yYSINsON1A6SUWsGJfD2rCsDJUqPWxqBOGxPPVxk8T0F_O5gQz8NfZiRcIQuyNoJUC17Y8G_Rw7N-yjyGjwy6vUFGPaxvOcZRc3FNVgPTtgPZhrboplSyhBBDs67e_vFNmEqo7394P91LnBtZjI9yvzCc0jOcGpjB0SYMwDrS0l-OAPCPcKTnV8sqp8hRqNs777pOafq4TDL2IC_AwE",
    bouquetName: "Midnight Romance Custom",
    bouquetImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD8IK4PcX6IdyO4I8wuuwS82VVT2D3Xso1tFQrEe5RcXI_CbBBYcnmSrOjP1WwBPFNhLME0tfOD11jF1IMG_bJfw7Vw8xHbC4YMjTCECm7YHZBFmTMUZVSmkVpuaWou_wgObZhrLdyEYntVmB9ZxfXhEbeJwmz6A0zfAdllpiqUhTj93eeTFzIlhhC5tci4U4n6jZhNOhCTylDA8WL0Mv2stuQxrwfyGAJE80CTUOuHlBmrujokSvRPkdNsi06bK7AX1ML3itSNNgw",
    details: "Red Roses, Sage Wrapping, Teddy Bear x2",
    recipient: "Clara Vance",
    delivery: "Oct 14, 2024 (Morning)",
    qty: 1,
    subtotal: "$124.00",
    deliveryCost: "$15.00",
    total: "$139.00",
    timelineStep: 2,
    progressImages: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDRGZRTSVBaBPQWCPvds2J-z8MMBeBfdfjIT75J-JcokpTc0sjLM-njCUAV1asJ-1lhTY9E67285F9tflgCQDmSDkYoAp8Smp7WhOO0UetPSQh0rmQ-nAAZw89aAIw8rDVz9z3LBERFQp0R3PuqBQRZWyeZ9wk6xWRkFfizQVW2xFkFgJZQsG_JjqVxibufx-sV51yuSIAsniV-l_S8vKW56INhgv5DQgCtsirAN1H2W9M65E1RaWHMklz4Q-ks1FjSArms3VyjBsw",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBcgMtQsbjRf7M3xvXqO1fQI-Ur1XJ2k8GKTZs2QBE7BTYMFv6-H5Xa6i-r_lfxnns72Cw1Gp-e6z3vnO-lerYwyxceTzVQ1LlKe8zZHev1BRnu7a5xV4N3gVC5l6-MRAnXVEvGMYyRVYbQ5R20DoInzbVNbFDQJhfWacDz5UehL3sCwHi_ikg2zOAgyKyuVbLkWhEexAFfZH_PVIvhXD-Ze0I1vGRYcZHboWuFra85figBmsqJSSjeax_cu0Vtxq2VszVnXwAyrCo",
    ],
  },
  {
    id: "2",
    orderId: "#FLW-88210-A",
    status: "Delivered",
    statusColor: "bg-surface-container text-on-surface-variant",
    floristName: "Petals & Poetry",
    floristImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAu3mYqV0XcOZ3eN08EpGRI8hjpYKwLA2V7mI-zStKjx6ZCAB77rQ4Cj4N9yfUPTKR1OFgEs5lgBLpUEKu_S3Ysc3ZEHLOJAB6KgI_jdl1ea2lU5ugvxreOpokMM83ZvDKT0gPFojOEsBeElnOJS4ycshLA8CicxF_PkVCLwhNoNnJvsy64cx92pVURNkAXxO9G284IClrUEfC5olxRVRmhDVmmcKeZg8mvEDoUWEEt34HgePuulaf5qnNgn-vychhs7YFke8WV2rc",
    bouquetName: "Soft Whispers Bouquet",
    bouquetImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBOOik4q_tzpN-m1nI7raLcUzJ8qwp2H59K5pOIugQL-JYp2OYTwaYKXke_ig1zRK1DY6dwXr4UwlS3gsANdyL44zXiW2wDqxCWXchmyBFaY381gI1y8K52sIBULn6POyt_JTJtVNTrCCZ0cf6xPJJxcA7vWUyDsFTtWTnq2ulrPuwMLh4WhSW0cOzibOd33ONEgeEoG1bQVpU7DI_ZzuKwaYRa7PXn3Gq6R2U2YdL1zjKFYw5mb8JOWTb3ZFypyhOwEtHYAZUP3wQ",
    details: "",
    recipient: "Eleanor Vance (Self)",
    delivery: "",
    qty: 1,
    subtotal: "",
    deliveryCost: "",
    total: "",
    timelineStep: 4,
    isPast: true,
  },
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

/* ──────────────────────────── Sub-components ──────────────────────────── */

function ProfileSidebar() {
  const [akunOpen, setAkunOpen] = useState(false);

  return (
    <aside className="w-full md:w-80 flex-shrink-0">
      <div className="bg-white rounded-2xl p-8 shadow-soft flex flex-col items-center sticky top-24">
        {/* Avatar */}
        <div className="relative mb-5 group">
          <img
            alt="Avatar"
            className="w-24 h-24 rounded-full object-cover border-4 border-surface-container shadow-md"
            src={USER.avatar}
          />
          <button className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full shadow-lg hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-[14px]">edit</span>
          </button>
        </div>
        <h2 className="font-headline text-[22px] font-semibold text-on-surface mb-0.5">{USER.name}</h2>
        <p className="text-[14px] text-on-surface-variant mb-1">{USER.label}</p>
        <a href="/profile/account" className="text-[12px] text-primary font-semibold hover:underline mb-6 flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">edit</span>
          Ubah Profil
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

function ActiveOrderCard({ order }: { order: OrderItem }) {
  return (
    <div className="bg-white rounded-2xl p-7 shadow-soft border border-outline-variant/10 hover:shadow-float hover:-translate-y-1 transition-all duration-300">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between pb-5 border-b border-outline-variant/20 mb-7 gap-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-secondary-container flex items-center justify-center overflow-hidden">
            <img alt={order.floristName} className="w-full h-full object-cover" src={order.floristImage} />
          </div>
          <div>
            <h3 className="text-[14px] font-semibold text-on-surface mb-0.5">{order.floristName}</h3>
            <div className="flex gap-2 items-center">
              <button className="text-[11px] font-semibold text-secondary hover:underline">Visit Store</button>
              <span className="text-outline-variant text-[10px]">•</span>
              <button className="text-[11px] font-semibold text-secondary hover:underline flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[13px]">chat_bubble</span>
                Chat
              </button>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-start lg:items-end">
          <span className={`${order.statusColor} px-3 py-1 rounded-full text-[11px] font-bold mb-1`}>
            {order.status}
          </span>
          <span className="text-[11px] text-on-surface-variant">Order ID: {order.orderId}</span>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col md:flex-row gap-7 mb-8">
        <div className="w-36 h-36 rounded-2xl overflow-hidden flex-shrink-0">
          <img alt={order.bouquetName} className="w-full h-full object-cover" src={order.bouquetImage} />
        </div>
        <div className="flex-grow">
          <h4 className="font-headline text-[22px] font-semibold text-primary mb-3">{order.bouquetName}</h4>
          <div className="space-y-1.5 mb-3">
            {order.details && (
              <p className="text-[13px] text-on-surface-variant flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                {order.details}
              </p>
            )}
            <p className="text-[13px] text-on-surface-variant flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">person</span>
              Recipient: {order.recipient}
            </p>
            {order.delivery && (
              <p className="text-[13px] text-on-surface-variant flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                Delivery: {order.delivery}
              </p>
            )}
          </div>
          <span className="bg-surface-container text-on-surface-variant px-3 py-1 rounded-full text-[11px]">
            Qty: {order.qty}
          </span>
        </div>
        <div className="w-full md:w-56 bg-surface-container-low rounded-2xl p-5 flex-shrink-0">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-[11px] text-on-surface-variant">
              <span>Subtotal</span>
              <span>{order.subtotal}</span>
            </div>
            <div className="flex justify-between text-[11px] text-on-surface-variant">
              <span>Delivery</span>
              <span>{order.deliveryCost}</span>
            </div>
            <div className="h-px bg-outline-variant/20 my-2" />
            <div className="flex justify-between text-[13px] font-semibold text-on-surface">
              <span>Total</span>
              <span className="text-primary">{order.total}</span>
            </div>
          </div>
          <button className="w-full py-3 bg-primary text-white rounded-full text-[13px] font-semibold hover:shadow-float transition-all active:scale-95">
            Track Progress
          </button>
        </div>
      </div>

      {/* Timeline + Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 border-t border-outline-variant/10 pt-8">
        <div>
          <h5 className="text-[13px] font-semibold text-on-surface mb-5 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[18px]">timeline</span>
            Bouquet Timeline
          </h5>
          <OrderTimeline step={order.timelineStep} />
        </div>
        <div>
          <h5 className="text-[13px] font-semibold text-on-surface mb-5 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[18px]">photo_camera</span>
            Real-time Progress
          </h5>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {order.progressImages?.map((img, i) => (
              <div key={i} className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity">
                <img alt={`Progress ${i + 1}`} className="w-full h-full object-cover" src={img} />
              </div>
            ))}
            <div className="w-20 h-20 rounded-xl bg-surface-container flex flex-col items-center justify-center text-on-surface-variant gap-1 cursor-not-allowed flex-shrink-0">
              <span className="material-symbols-outlined text-[20px]">lock</span>
              <span className="text-[10px]">Next update</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PastOrderCard({ order }: { order: OrderItem }) {
  return (
    <div className="bg-white rounded-2xl p-7 shadow-soft border border-outline-variant/10 opacity-80 hover:opacity-100 transition-all">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between pb-5 border-b border-outline-variant/20 mb-7 gap-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center overflow-hidden">
            <img alt={order.floristName} className="w-full h-full object-cover" src={order.floristImage} />
          </div>
          <div>
            <h3 className="text-[14px] font-semibold text-on-surface mb-0.5">{order.floristName}</h3>
            <div className="flex gap-2 items-center">
              <button className="text-[11px] font-semibold text-secondary hover:underline">Visit Store</button>
              <span className="text-outline-variant text-[10px]">•</span>
              <button className="text-[11px] font-semibold text-secondary hover:underline flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[13px]">chat_bubble</span>
                Chat
              </button>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-start lg:items-end">
          <span className={`${order.statusColor} px-3 py-1 rounded-full text-[11px] font-bold mb-1`}>
            {order.status}
          </span>
          <span className="text-[11px] text-on-surface-variant">Order ID: {order.orderId}</span>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col md:flex-row gap-7">
        <div className="w-36 h-36 rounded-2xl overflow-hidden flex-shrink-0 grayscale-[0.15]">
          <img alt={order.bouquetName} className="w-full h-full object-cover" src={order.bouquetImage} />
        </div>
        <div className="flex-grow">
          <h4 className="font-headline text-[22px] font-semibold text-on-surface mb-2">{order.bouquetName}</h4>
          <p className="text-[13px] text-on-surface-variant mb-5">Recipient: {order.recipient}</p>
          <div className="flex gap-3">
            <button className="px-5 py-2.5 bg-secondary text-white rounded-full text-[13px] font-semibold hover:shadow-float transition-all active:scale-95">
              Buy Again
            </button>
            <button className="px-5 py-2.5 border border-outline-variant text-on-surface-variant rounded-full text-[13px] font-semibold hover:bg-surface-container transition-all">
              Write Review
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────── Page ──────────────────────────── */

export default function ProfilePage() {
  const [activeFilter, setActiveFilter] = useState<OrderFilter>("all");
  const [search, setSearch] = useState("");

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
              My Orders
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
                placeholder="Search by florist, bouquet, recipient, or order #"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
                search
              </span>
            </div>
          </div>

          {/* Orders */}
          <div className="space-y-6">
            {ORDERS.map((order) =>
              order.isPast ? (
                <PastOrderCard key={order.id} order={order} />
              ) : (
                <ActiveOrderCard key={order.id} order={order} />
              )
            )}
          </div>

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