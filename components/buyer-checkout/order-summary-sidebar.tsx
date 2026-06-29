"use client";

import OrderItemRow from "./order-item-row";
import { formatRupiah } from "@/utils/format";
import type { ShippingOption } from "@/types/checkout";

interface CheckoutItem {
  id?: string;
  name: string;
  florist: string;
  price: number;
  qty: number;
  image: string;
  flowerType?: string;
  wrappingColor?: string;
  wrappingLabel?: string;
  addons?: { name: string; qty?: number; price: number; icon: string; image?: string }[];
}

interface OrderSummarySidebarProps {
  orderItems: CheckoutItem[];
  subtotal: number;
  itemCount: number;
  shippingTotal: number;
  serviceFee: number;
  total: number;
  selectedShipping: Record<number, ShippingOption>;
}

export default function OrderSummarySidebar({
  orderItems,
  subtotal,
  itemCount,
  shippingTotal,
  serviceFee,
  total,
  selectedShipping,
}: OrderSummarySidebarProps) {
  return (
    <div className="col-span-12 lg:col-span-5 xl:col-span-4">
      <div className="sticky top-24 space-y-5">
        {/* Items */}
        <div className="bg-white rounded-xl border border-outline-variant/40 p-5 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-body text-[13px] font-semibold text-on-surface-variant uppercase tracking-wider">
              Pesananmu
            </h3>
          </div>
          <div className="divide-y divide-outline-variant/20">
            {orderItems.map((item, i) => (
              <OrderItemRow key={item.id || i} item={item} />
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
            {shippingTotal > 0 && (
              <>
                <div className="flex justify-between text-[13px]">
                  <span className="text-on-surface-variant">Ongkos Kirim</span>
                  <span className="font-medium text-on-surface">{formatRupiah(shippingTotal)}</span>
                </div>
                {Object.values(selectedShipping).map((s) => (
                  <div key={s.store_id} className="flex justify-between text-[12px] pl-4">
                    <span className="text-on-surface-variant">
                      {s.courier_name} {s.courier_service}
                    </span>
                    <span className="text-on-surface-variant">{formatRupiah(s.shipping_cost)}</span>
                  </div>
                ))}
              </>
            )}
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
            <span className="material-symbols-outlined text-secondary text-[22px] mt-0.5" style={{ fontVariationSettings: "'FILL' 1" } as React.CSSProperties}>
              verified_user
            </span>
            <div>
              <p className="text-[13px] font-semibold text-on-surface">Garansi Flowera</p>
              <p className="text-[11px] text-on-surface-variant leading-4 mt-1">
                Jika bunga tidak segar saat diterima, kami ganti 100% tanpa syarat.
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
  );
}
