"use client";

import React, { useState, useEffect, useCallback } from "react";
import { getAdminOrders } from "@/utils/admin-api";
import { getOrderStatusLabel, getOrderStatusBadgeClass, deriveServiceFee } from "@/utils/order-utils";

/* ─────────────────── Types ─────────────────── */

interface AdminOrder {
  id: number;
  orderNumber?: string;
  status?: string;
  total?: number | null;
  items_total?: number | null;
  shipping_total?: number | null;
  discount?: number | null;
  createdAt?: string;
  user_id?: {
    id: number;
    name: string;
    email?: string;
  } | null;
  payment_order?: {
    id?: number;
    status?: string;
    payment_time?: string;
    payment_method?: string;
    payment_channel?: string;
    transaction_id?: string;
  } | null;
  order_item?: any[];
}

/* ─────────────────── Helpers ─────────────────── */

function formatCurrency(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getPaymentStatusBadge(paymentStatus: string | undefined): { label: string; className: string } {
  if (!paymentStatus) {
    return { label: "Belum Bayar", className: "bg-surface-container-high text-on-surface-variant" };
  }
  const s = paymentStatus.toLowerCase();
  if (s === "settlement" || s === "capture" || s === "success") {
    return { label: "Lunas", className: "bg-secondary-container text-secondary" };
  }
  if (s === "pending") {
    return { label: "Pending", className: "bg-tertiary-container text-on-tertiary-container" };
  }
  if (s === "deny" || s === "cancel" || s === "expire" || s === "failure") {
    return { label: "Gagal", className: "bg-error-container text-error" };
  }
  if (s === "refund" || s === "chargeback") {
    return { label: "Refund", className: "bg-error-container text-error" };
  }
  return { label: paymentStatus, className: "bg-surface-container-high text-on-surface-variant" };
}

/* ─────────────────── Page ─────────────────── */

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getAdminOrders();
      if (res.status === "success") {
        setOrders(res.data ?? []);
      } else {
        setError((res as any).message || "Gagal memuat pesanan");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Gagal memuat pesanan");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  /* ── Collect unique statuses for filter dropdown ── */
  const statuses = Array.from(
    new Set(orders.map((o) => o.status).filter(Boolean))
  ).sort() as string[];

  /* ── Filter ── */
  const filtered = orders.filter((o) => {
    if (statusFilter !== "all" && o.status !== statusFilter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const orderNum = (o.orderNumber || String(o.id)).toLowerCase();
    const buyerName = (o.user_id?.name || "").toLowerCase();
    const buyerEmail = (o.user_id?.email || "").toLowerCase();
    const paymentMethod = (o.payment_order?.payment_method || "").toLowerCase();
    const paymentChannel = (o.payment_order?.payment_channel || "").toLowerCase();
    return (
      orderNum.includes(q) ||
      buyerName.includes(q) ||
      buyerEmail.includes(q) ||
      paymentMethod.includes(q) ||
      paymentChannel.includes(q)
    );
  });

  /* ── Summary ── */
  const totalRevenue = filtered
    .filter((o) => o.payment_order?.status?.toLowerCase() === "settlement")
    .reduce((sum, o) => sum + deriveServiceFee({ total: o.total ?? null, items_total: o.items_total, shipping_total: o.shipping_total, discount: o.discount }), 0);

  /* ── Render ── */
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <span className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-[14px] text-on-surface-variant">Memuat pesanan...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <span className="material-symbols-outlined text-[40px] text-error">error</span>
        <p className="text-[14px] text-error">{error}</p>
        <button onClick={fetchOrders} className="px-6 py-3 bg-primary text-white rounded-xl text-[14px] font-semibold">
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-headline text-[24px] font-semibold text-on-surface">Semua Pesanan</h2>
          <p className="text-[13px] text-on-surface-variant mt-1">
            Lihat semua pesanan yang terjadi di platform.
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="px-5 py-3 border border-outline-variant/40 rounded-xl text-[14px] font-semibold text-on-surface-variant hover:bg-surface-container-high transition-all flex items-center gap-2 self-start"
        >
          <span className="material-symbols-outlined text-[18px]">refresh</span>
          Refresh
        </button>
      </div>

      {/* Filters & Summary */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant/60 pointer-events-none">search</span>
          <input
            type="text"
            placeholder="Cari berdasarkan nomor pesanan, pembeli, atau metode bayar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-outline-variant/30 rounded-xl text-[13px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 bg-white border border-outline-variant/30 rounded-xl text-[13px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all min-w-[180px]"
        >
          <option value="all">Semua Status</option>
          {statuses.map((s) => (
            <option key={s} value={s}>{getOrderStatusLabel(s)}</option>
          ))}
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-soft border border-outline-variant/20">
          <p className="text-[11px] text-on-surface-variant font-semibold uppercase tracking-wider">Total Pesanan</p>
          <p className="text-[28px] font-bold text-on-surface mt-1">{filtered.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-soft border border-outline-variant/20">
          <p className="text-[11px] text-on-surface-variant font-semibold uppercase tracking-wider">Pesanan Lunas</p>
          <p className="text-[28px] font-bold text-on-surface mt-1">
            {filtered.filter((o) => o.payment_order?.status?.toLowerCase() === "settlement").length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-soft border border-outline-variant/20">
          <p className="text-[11px] text-on-surface-variant font-semibold uppercase tracking-wider">Pendapatan Layanan</p>
          <p className="text-[28px] font-bold text-on-surface mt-1">{formatCurrency(totalRevenue)}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-soft border border-outline-variant/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-surface-container-low">
                <th className="text-left px-6 py-3 text-[12px] font-semibold text-on-surface-variant tracking-wider uppercase">#</th>
                <th className="text-left px-6 py-3 text-[12px] font-semibold text-on-surface-variant tracking-wider uppercase">No. Pesanan</th>
                <th className="text-left px-6 py-3 text-[12px] font-semibold text-on-surface-variant tracking-wider uppercase">Pembeli</th>
                <th className="text-right px-6 py-3 text-[12px] font-semibold text-on-surface-variant tracking-wider uppercase">Total</th>
                <th className="text-center px-6 py-3 text-[12px] font-semibold text-on-surface-variant tracking-wider uppercase">Status Pesanan</th>
                <th className="text-center px-6 py-3 text-[12px] font-semibold text-on-surface-variant tracking-wider uppercase">Pembayaran</th>
                <th className="text-left px-6 py-3 text-[12px] font-semibold text-on-surface-variant tracking-wider uppercase">Tanggal</th>
                <th className="text-center px-6 py-3 text-[12px] font-semibold text-on-surface-variant tracking-wider uppercase">Item</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-on-surface-variant">
                    {search.trim() || statusFilter !== "all" ? (
                      <div className="flex flex-col items-center gap-2">
                        <span className="material-symbols-outlined text-[36px] text-on-surface-variant/40">search_off</span>
                        <p className="text-[13px]">Tidak ada pesanan yang cocok dengan filter.</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <span className="material-symbols-outlined text-[36px] text-on-surface-variant/40">receipt_long</span>
                        <p className="text-[13px]">Belum ada pesanan.</p>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                filtered.map((o, i) => {
                  const paymentBadge = getPaymentStatusBadge(o.payment_order?.status);
                  const orderStatusLabel = getOrderStatusLabel(o.status || "");
                  const orderStatusBadge = getOrderStatusBadgeClass(o.status || "");
                  const itemCount = o.order_item?.length ?? 0;
                  const fee = deriveServiceFee({
                    total: o.total ?? null,
                    items_total: o.items_total,
                    shipping_total: o.shipping_total,
                    discount: o.discount,
                  });

                  return (
                    <tr key={o.id} className="hover:bg-surface-container-lowest transition-colors">
                      <td className="px-6 py-4 text-[13px] text-on-surface-variant">{i + 1}</td>
                      <td className="px-6 py-4">
                        <p className="text-[14px] font-semibold text-primary font-mono">
                          {o.orderNumber || `#${o.id}`}
                        </p>
                        {o.payment_order?.payment_method && (
                          <p className="text-[11px] text-on-surface-variant capitalize">
                            {o.payment_order.payment_method}
                            {o.payment_order.payment_channel ? ` • ${o.payment_order.payment_channel}` : ""}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-[14px] font-medium text-on-surface">
                          {o.user_id?.name || "Unknown"}
                        </p>
                        {o.user_id?.email && (
                          <p className="text-[11px] text-on-surface-variant">{o.user_id.email}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="text-[14px] font-semibold text-on-surface">
                          {o.total != null ? formatCurrency(o.total) : "-"}
                        </p>
                        <p className="text-[10px] text-on-surface-variant">
                          Fee: {formatCurrency(fee)}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${orderStatusBadge}`}>
                          {orderStatusLabel}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${paymentBadge.className}`}>
                          {paymentBadge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[12px] text-on-surface-variant whitespace-nowrap">
                        {formatDate(o.payment_order?.payment_time || o.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-[13px] font-medium text-on-surface-variant">
                          {itemCount > 0 ? `${itemCount} item` : "-"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-[12px] text-on-surface-variant text-right">
        Menampilkan {filtered.length} dari {orders.length} pesanan
      </p>
    </div>
  );
}
