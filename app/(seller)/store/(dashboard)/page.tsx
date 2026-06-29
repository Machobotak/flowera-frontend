"use client";

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { getSellerOrders } from "@/utils/seller-order-api";
import type { SellerOrder } from "@/types/order";

function formatCurrency(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

/* ──────────────────────────── Stats Helpers ──────────────────────────── */

/** Orders that need seller action (PAID = waiting confirmation) */
const ACTIVE_STATUSES = ["CONFIRM_SELLER", "PROSES_PENGERJAAN", "DELIVERY"];

/** Orders that contribute to revenue (exclude UNPAID, EXPIRED, CANCELLED) */
const REVENUE_STATUSES = [
  "PAID",
  "CONFIRM_SELLER",
  "PROSES_PENGERJAAN",
  "CONFIRM_USER",
  "DELIVERY",
  "DITERIMA",
];

function computeStats(orders: SellerOrder[], productCount: number) {
  const newOrders = orders.filter((o) => o.status === "PAID").length;
  const activeOrders = orders.filter((o) =>
    ACTIVE_STATUSES.includes(o.status)
  ).length;
  const revenue = orders
    .filter((o) => REVENUE_STATUSES.includes(o.status))
    .reduce((sum, o) => sum + (o.total ?? 0), 0);

  return { newOrders, activeOrders, productCount, revenue };
}

/* ──────────────────────────── Stat Card ──────────────────────────── */

function StatCard({
  icon,
  label,
  value,
  sublabel,
  colorClass,
}: {
  icon: string;
  label: string;
  value: string;
  sublabel?: string;
  colorClass: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-soft border border-outline-variant/20 hover:shadow-float transition-all">
      <div className="flex items-center gap-4 mb-4">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClass}`}
        >
          <span
            className="material-symbols-outlined text-[24px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {icon}
          </span>
        </div>
        <div>
          <h3 className="text-[14px] font-semibold text-on-surface-variant">
            {label}
          </h3>
          <p className="text-[24px] font-bold text-on-surface">{value}</p>
          {sublabel && (
            <p className="text-[11px] text-on-surface-variant mt-0.5">
              {sublabel}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────── Dashboard Page ──────────────────────────── */

export default function StoreDashboard() {
  const [stats, setStats] = useState({
    newOrders: 0,
    activeOrders: 0,
    productCount: 0,
    revenue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const [ordersRes, productsRes] = await Promise.all([
        getSellerOrders(),
        axios.get("/api/seller/product", { withCredentials: true }),
      ]);

      const orders: SellerOrder[] =
        ordersRes.status === "success" ? ordersRes.data : [];
      const products =
        productsRes.data?.status === "success"
          ? productsRes.data.data ?? []
          : [];

      setStats(computeStats(orders, Array.isArray(products) ? products.length : 0));
    } catch {
      // Silently fail — stats stay at 0
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-soft border border-outline-variant/20">
        <h2 className="font-headline text-[24px] font-semibold text-on-surface mb-2">
          Selamat Datang di Seller Center!
        </h2>
        <p className="text-[14px] text-on-surface-variant">
          Kelola toko, pesanan, dan produk Anda dengan mudah dari halaman ini.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon="local_mall"
          label="Pesanan Baru"
          value={isLoading ? "..." : String(stats.newOrders)}
          sublabel="Menunggu konfirmasi"
          colorClass="bg-primary-container text-primary"
        />

        <StatCard
          icon="autorenew"
          label="Sedang Diproses"
          value={isLoading ? "..." : String(stats.activeOrders)}
          sublabel="Dalam pengerjaan"
          colorClass="bg-tertiary-container text-on-tertiary-container"
        />

        <StatCard
          icon="inventory_2"
          label="Total Produk"
          value={isLoading ? "..." : String(stats.productCount)}
          sublabel="Produk aktif"
          colorClass="bg-secondary-container text-secondary"
        />

        <StatCard
          icon="payments"
          label="Pendapatan"
          value={isLoading ? "..." : formatCurrency(stats.revenue)}
          sublabel="Dari pesanan aktif"
          colorClass="bg-primary-container text-primary"
        />
      </div>

      {/* Quick Info */}
      {!isLoading && stats.newOrders === 0 && stats.activeOrders === 0 && (
        <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/20 text-center">
          <span
            className="material-symbols-outlined text-[40px] text-on-surface-variant/40 mb-3 block"
          >
            auto_awesome
          </span>
          <p className="text-[14px] text-on-surface-variant">
            Belum ada pesanan masuk. Promosikan toko Anda untuk menarik pembeli!
          </p>
        </div>
      )}
    </div>
  );
}
