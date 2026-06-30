"use client";

import React, { useState, useEffect, useCallback } from "react";
import { getAdminUsers, getAdminSellers, getAdminOrders } from "@/utils/admin-api";
import { SERVICE_FEE } from "@/utils/order-utils";

/* ─────────────────── Types ─────────────────── */

interface DailyData {
  date: string;     // "2026-06-29"
  label: string;    // "29"
  month: string;    // "Jun"
  count: number;
  revenue: number;
}

/* ─────────────────── Helpers ─────────────────── */

const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

/** Group items by day within the last 30 days */
function groupByDay<T extends { createdAt: string }>(items: T[]): DailyData[] {
  const counts: Record<string, number> = {};
  for (const item of items) {
    const d = new Date(item.createdAt);
    if (isNaN(d.getTime())) continue;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    counts[key] = (counts[key] || 0) + 1;
  }

  const result: DailyData[] = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    result.push({
      date: key,
      label: String(d.getDate()),
      month: MONTH_SHORT[d.getMonth()],
      count: counts[key] || 0,
      revenue: 0,
    });
  }
  return result;
}

/** Group orders by day using payment_order settlement status, revenue = count × SERVICE_FEE */
function groupOrdersByDay(orders: any[]): DailyData[] {
  const counts: Record<string, number> = {};
  for (const o of orders) {
    // Only count orders where payment status is 'settlement'
    const paymentStatus = o.payment_order?.status?.toLowerCase();
    if (paymentStatus !== 'settlement') continue;
    // Use payment_time if available, otherwise fallback to createdAt
    const dateStr = o.payment_order?.payment_time || o.createdAt;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) continue;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    counts[key] = (counts[key] || 0) + 1;
  }

  const result: DailyData[] = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const c = counts[key] || 0;
    result.push({
      date: key,
      label: String(d.getDate()),
      month: MONTH_SHORT[d.getMonth()],
      count: c,
      revenue: c * SERVICE_FEE,
    });
  }
  return result;
}

function formatCurrency(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

/* ─────────────────── Line Chart (SVG) ─────────────────── */

function getLineColors(colorClass: string): { stroke: string; fill: string } {
  if (colorClass.includes("primary")) return { stroke: "#8c4a5c", fill: "rgba(140,74,92,0.12)" };
  if (colorClass.includes("secondary")) return { stroke: "#3a6847", fill: "rgba(58,104,71,0.12)" };
  if (colorClass.includes("tertiary")) return { stroke: "#735c00", fill: "rgba(115,92,0,0.12)" };
  return { stroke: "#8c4a5c", fill: "rgba(140,74,92,0.12)" };
}

function LineChart({
  data,
  valueKey,
  colorClass,
  formatValue,
  maxValue,
}: {
  data: DailyData[];
  valueKey: "count" | "revenue";
  colorClass: string;
  formatValue: (v: number) => string;
  maxValue: number;
}) {
  const { stroke, fill } = getLineColors(colorClass);
  const [hoverIdx, setHoverIdx] = React.useState<number | null>(null);
  const W = 900;
  const H = 180;
  const pad = { top: 18, right: 28, bottom: 28, left: 36 };
  const effectiveMax = maxValue > 0 ? maxValue : 1;
  const chartH = H - pad.top - pad.bottom;
  const gw = (W - pad.left - pad.right) / (data.length - 1 || 1);

  const points = data.map((d, i) => {
    const x = pad.left + i * gw;
    const y = pad.top + chartH - ((d[valueKey] / effectiveMax) * chartH);
    return { x, y, v: d[valueKey], label: d.label, month: d.month, date: d.date };
  });

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaD = points.length > 0
    ? `M${points[0].x},${pad.top + chartH} L${points.map((p) => `${p.x},${p.y}`).join(" ")} L${points[points.length - 1].x},${pad.top + chartH} Z`
    : "";

  const xLabelInterval = 5;
  const hoverPoint = hoverIdx !== null ? points[hoverIdx] : null;

  return (
    <div className="relative overflow-visible pt-8">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto min-w-[500px] overflow-visible">
        {/* Grid */}
        {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
          const y = pad.top + chartH - frac * chartH;
          return (
            <g key={frac}>
              <line x1={pad.left} y1={y} x2={W - pad.right} y2={y}
                stroke="#d7c1c5" strokeWidth="0.5" strokeDasharray="3,3" />
              <text x={pad.left - 4} y={y + 3} textAnchor="end"
                className="text-[8px]" fill="#847376">
                {formatValue(Math.round(effectiveMax * frac))}
              </text>
            </g>
          );
        })}

        {/* Area */}
        <path d={areaD} fill={fill} />

        {/* Line */}
        <path d={pathD} fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

        {/* Hover vertical line */}
        {hoverPoint && (
          <line x1={hoverPoint.x} y1={pad.top} x2={hoverPoint.x} y2={pad.top + chartH}
            stroke={stroke} strokeWidth="1" strokeDasharray="4,3" opacity="0.5" />
        )}

        {/* Invisible wide hit targets */}
        {points.map((p, i) => (
          <rect
            key={i}
            x={p.x - gw / 2}
            y={pad.top}
            width={gw}
            height={chartH}
            fill="transparent"
            className="cursor-pointer"
            onMouseEnter={() => setHoverIdx(i)}
            onMouseLeave={() => setHoverIdx(null)}
          />
        ))}

        {/* Dots */}
        {points.map((p, i) => {
          const isHovered = hoverIdx === i;
          const showDot = isHovered || i % 3 === 0 || p.v > 0;
          if (!showDot) return null;
          const r = isHovered ? 5 : p.v > 0 ? 3 : 1.5;
          return (
            <g key={i}>
              {isHovered && (
                <circle cx={p.x} cy={p.y} r={8} fill={stroke} opacity="0.15" />
              )}
              <circle cx={p.x} cy={p.y} r={r} fill="#fff" stroke={stroke}
                strokeWidth={isHovered ? "2.5" : "1.5"}
                className="transition-all duration-150" />
            </g>
          );
        })}

        {/* X-axis */}
        {points.map((p, i) => {
          const show = i === 0 || i === points.length - 1 || i % xLabelInterval === 0;
          if (!show) return null;
          return (
            <text key={i} x={p.x} y={H - 6} textAnchor="middle"
              className="text-[9px]" fill="#847376">
              {p.label} {p.month}
            </text>
          );
        })}
      </svg>

      {/* Hover tooltip */}
      {hoverPoint && (
        <div
          className="absolute pointer-events-none bg-on-surface text-surface px-3 py-1.5 rounded-lg text-[11px] font-medium shadow-lg whitespace-nowrap z-10 transition-opacity duration-100"
          style={{
            left: `${((hoverPoint.x / W) * 100).toFixed(1)}%`,
            top: "0",
            transform: "translate(-50%, -110%)",
          }}
        >
          {hoverPoint.label} {hoverPoint.month}: <span className="font-bold">{formatValue(hoverPoint.v)}</span>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-2 mt-2">
        <div className="w-3 h-0.5 rounded-full" style={{ backgroundColor: stroke }} />
        <span className="text-[10px] text-on-surface-variant">
          {hoverPoint
            ? `${hoverPoint.label} ${hoverPoint.month}: ${formatValue(hoverPoint.v)}`
            : "Arahkan kursor ke grafik"}
        </span>
      </div>
    </div>
  );
}

/* ─────────────────── Stat Card ─────────────────── */

function StatCard({
  icon, label, value, sublabel, colorClass,
}: {
  icon: string; label: string; value: string; sublabel?: string; colorClass: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-soft border border-outline-variant/20">
      <div className="flex items-center gap-4 mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClass}`}>
          <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
        </div>
        <div>
          <h3 className="text-[14px] font-semibold text-on-surface-variant">{label}</h3>
          <p className="text-[24px] font-bold text-on-surface">{value}</p>
          {sublabel && <p className="text-[11px] text-on-surface-variant mt-0.5">{sublabel}</p>}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────── Dashboard Page ─────────────────── */

export default function AdminDashboard() {
  const [userData, setUserData] = useState<DailyData[]>([]);
  const [sellerData, setSellerData] = useState<DailyData[]>([]);
  const [orderData, setOrderData] = useState<DailyData[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalSellers, setTotalSellers] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [usersRes, sellersRes, ordersRes] = await Promise.all([
        getAdminUsers(),
        getAdminSellers(),
        getAdminOrders(),
      ]);

      let users = usersRes.status === "success" ? usersRes.data ?? [] : [];
      let sellers = sellersRes.status === "success" ? sellersRes.data ?? [] : [];
      let orders = ordersRes.status === "success" ? ordersRes.data ?? [] : [];

      // Filter out "Unknown" entries
      users = users.filter((u: any) => u.name && u.name !== "Unknown");
      sellers = sellers.filter((s: any) => {
        const userName = s.user?.name;
        const storeName = s.store?.name;
        return userName && userName !== "Unknown" && (!storeName || storeName !== "Unknown");
      });

      setTotalUsers(users.length);
      setTotalSellers(sellers.length);
      setTotalOrders(orders.length);
      setUserData(groupByDay(users));
      setSellerData(groupByDay(sellers));
      const orderDaily = groupOrdersByDay(orders);
      setOrderData(orderDaily);
      setTotalRevenue(orderDaily.reduce((sum, m) => sum + m.revenue, 0));
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const maxUsers = Math.max(...userData.map((d) => d.count), 1);
  const maxSellers = Math.max(...sellerData.map((d) => d.count), 1);
  const maxRevenue = Math.max(...orderData.map((d) => d.revenue), 1);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <span className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-[14px] text-on-surface-variant">Memuat dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-white rounded-2xl p-6 shadow-soft border border-outline-variant/20">
        <h2 className="font-headline text-[24px] font-semibold text-on-surface mb-2">
          Selamat Datang di Admin Center!
        </h2>
        <p className="text-[14px] text-on-surface-variant">
          Kelola pengguna, seller, pesanan, dan produk dari halaman ini.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon="people" label="Total Users" value={String(totalUsers)} sublabel="Terdaftar di platform" colorClass="bg-primary-container text-primary" />
        <StatCard icon="storefront" label="Total Sellers" value={String(totalSellers)} sublabel="Toko terdaftar" colorClass="bg-secondary-container text-secondary" />
        <StatCard icon="shopping_bag" label="Total Pesanan" value={String(totalOrders)} sublabel="Semua pesanan" colorClass="bg-tertiary-container text-on-tertiary-container" />
        <StatCard icon="payments" label="Pendapatan Layanan" value={formatCurrency(totalRevenue)} sublabel="Dari transaksi sukses" colorClass="bg-error-container text-error" />
      </div>

      {/* Charts — Last 30 Days, full width */}
      <div className="space-y-6 overflow-visible">
        <div className="bg-white rounded-2xl p-6 shadow-soft border border-outline-variant/20 overflow-visible">
          <h3 className="text-[14px] font-semibold text-on-surface mb-1">User Baru</h3>
          <p className="text-[11px] text-on-surface-variant mb-5">30 hari terakhir</p>
          <LineChart data={userData} valueKey="count" colorClass="bg-primary" formatValue={(v) => String(v)} maxValue={maxUsers} />
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-soft border border-outline-variant/20 overflow-visible">
          <h3 className="text-[14px] font-semibold text-on-surface mb-1">Seller Baru</h3>
          <p className="text-[11px] text-on-surface-variant mb-5">30 hari terakhir</p>
          <LineChart data={sellerData} valueKey="count" colorClass="bg-secondary" formatValue={(v) => String(v)} maxValue={maxSellers} />
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-soft border border-outline-variant/20 overflow-visible">
          <h3 className="text-[14px] font-semibold text-on-surface mb-1">Pesanan Baru</h3>
          <p className="text-[11px] text-on-surface-variant mb-5">30 hari terakhir (transaksi lunas)</p>
          <LineChart data={orderData} valueKey="count" colorClass="bg-tertiary" formatValue={(v) => String(v)} maxValue={Math.max(...orderData.map((d) => d.count), 1)} />
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-soft border border-outline-variant/20 overflow-visible">
          <h3 className="text-[14px] font-semibold text-on-surface mb-1">Pendapatan Layanan</h3>
          <p className="text-[11px] text-on-surface-variant mb-5">30 hari terakhir (transaksi lunas)</p>
          <LineChart data={orderData} valueKey="revenue" colorClass="bg-tertiary" formatValue={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}rb` : String(v)} maxValue={maxRevenue} />
        </div>
      </div>
    </div>
  );
}
