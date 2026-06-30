"use client";

import React from "react";
import type { SellerOrderDetail } from "@/types/order";
import { getOrderStatusLabel, getOrderStatusBadgeClass, deriveServiceFee } from "@/utils/order-utils";

interface OrderDetailModalProps {
  isOpen: boolean;
  order: SellerOrderDetail | null;
  isLoading: boolean;
  onClose: () => void;
}

function formatCurrency(amount: number | null | undefined): string {
  if (amount == null) return "Rp 0";
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function OrderDetailModal({
  isOpen,
  order,
  isLoading,
  onClose,
}: OrderDetailModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm animate-[fadeIn_0.15s_ease]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl my-8 animate-[slideUp_0.2s_ease]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant/20">
          <h3 className="font-headline text-[18px] font-bold text-on-surface">
            Detail Pesanan
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[20px] text-on-surface-variant">
              close
            </span>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              <p className="text-[14px] text-on-surface-variant">
                Memuat detail pesanan...
              </p>
            </div>
          ) : !order ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <span className="material-symbols-outlined text-[40px] text-on-surface-variant/40">
                error
              </span>
              <p className="text-[14px] text-on-surface-variant">
                Gagal memuat detail pesanan.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Order Header Info */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[12px] text-on-surface-variant uppercase tracking-wide">
                    No. Pesanan
                  </p>
                  <p className="text-[16px] font-bold text-on-surface">
                    {order.orderNumber}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-[11px] font-bold ${getOrderStatusBadgeClass(
                    order.status
                  )}`}
                >
                  {getOrderStatusLabel(order.status)}
                </span>
              </div>

              <div className="text-[12px] text-on-surface-variant">
                {formatDate(order.createdAt)}
              </div>

              {/* Customer Info */}
              <div className="bg-surface-container-lowest rounded-xl p-4 space-y-2">
                <h4 className="text-[13px] font-semibold text-on-surface">
                  Informasi Pelanggan
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[13px]">
                  <div>
                    <span className="text-on-surface-variant">Nama: </span>
                    <span className="text-on-surface font-medium">
                      {order.user_id.name}
                    </span>
                  </div>
                  <div>
                    <span className="text-on-surface-variant">Email: </span>
                    <span className="text-on-surface font-medium">
                      {order.user_id.email}
                    </span>
                  </div>
                  {order.user_id.phone_number && (
                    <div>
                      <span className="text-on-surface-variant">Telepon: </span>
                      <span className="text-on-surface font-medium">
                        {order.user_id.phone_number}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="text-[13px] font-semibold text-on-surface mb-3">
                  Produk Dipesan ({order.order_item.length})
                </h4>
                <div className="space-y-3">
                  {order.order_item.map((item) => (
                    <div
                      key={item.id}
                      className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/10"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-semibold text-on-surface">
                            {item.product_id.name}
                          </p>
                          {item.product_variant_id && (
                            <p className="text-[12px] text-on-surface-variant mt-0.5">
                              Varian: {item.product_variant_id.title} —{" "}
                              {item.product_variant_id.subTitle}
                            </p>
                          )}
                          <p className="text-[12px] text-on-surface-variant mt-1">
                            {item.quantity}x @ {formatCurrency(item.price)}
                          </p>
                        </div>
                        <p className="text-[14px] font-semibold text-primary shrink-0">
                          {formatCurrency(item.subTotal)}
                        </p>
                      </div>

                      {/* Shipping Info */}
                      <div className="mt-3 pt-3 border-t border-outline-variant/10 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-on-surface-variant">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">
                            local_shipping
                          </span>
                          {item.courier_name} — {item.courier_service}
                        </span>
                        <span>Estimasi: {item.shipping_etd}</span>
                        <span className="font-medium text-on-surface">
                          {formatCurrency(item.shipping_cost)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Totals */}
              <div className="bg-surface-container-lowest rounded-xl p-4 space-y-2">
                <h4 className="text-[13px] font-semibold text-on-surface mb-2">
                  Ringkasan Pembayaran
                </h4>
                <div className="flex justify-between text-[13px]">
                  <span className="text-on-surface-variant">Total Produk</span>
                  <span className="text-on-surface">
                    {formatCurrency(order.items_total)}
                  </span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span className="text-on-surface-variant">Total Ongkir</span>
                  <span className="text-on-surface">
                    {formatCurrency(order.shipping_total)}
                  </span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span className="text-on-surface-variant">Biaya Layanan</span>
                  <span className="text-on-surface">
                    {formatCurrency(deriveServiceFee(order))}
                  </span>
                </div>
                {order.discount != null && order.discount > 0 && (
                  <div className="flex justify-between text-[13px]">
                    <span className="text-on-surface-variant">Diskon</span>
                    <span className="text-error">
                      -{formatCurrency(order.discount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-outline-variant/20">
                  <span className="text-[14px] font-semibold text-on-surface">
                    Total
                  </span>
                  <span className="text-[16px] font-bold text-primary">
                    {formatCurrency(order.total)}
                  </span>
                </div>
              </div>

              {/* Customer Note */}
              {order.note && (
                <div className="bg-surface-container-lowest rounded-xl p-4">
                  <h4 className="text-[13px] font-semibold text-on-surface mb-1">
                    Catatan Pelanggan
                  </h4>
                  <p className="text-[13px] text-on-surface-variant">
                    {order.note}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-outline-variant/20 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-outline-variant/40 text-on-surface font-semibold text-[14px] rounded-xl hover:bg-surface-container transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
