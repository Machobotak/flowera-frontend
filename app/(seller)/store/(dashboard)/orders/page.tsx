"use client";

import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import ToastContainer from "@/components/toast-container";

// Mock data for orders
const MOCK_ORDERS = [
  {
    id: "ORD-92841",
    customerName: "Eleanor Vance",
    productName: "Midnight Romance Custom",
    status: "Menunggu Diproses",
    date: "24 Jun 2026, 10:30",
    total: "Rp 250.000",
  },
  {
    id: "ORD-88210",
    customerName: "Budi Santoso",
    productName: "Soft Whispers Bouquet",
    status: "Sedang Diproses",
    date: "23 Jun 2026, 14:15",
    total: "Rp 150.000",
  },
];

export default function StoreOrdersPage() {
  const [orders, setOrders] = useState(MOCK_ORDERS);
  const { toasts, addToast, removeToast } = useToast();

  const handleProcessOrder = (id: string) => {
    // Simulasi memproses pesanan
    setOrders(orders.map(order =>
      order.id === id ? { ...order, status: "Sedang Diproses" } : order
    ));
    addToast(`Pesanan ${id} sedang diproses!`, "success");
  };

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className="flex items-center justify-between">
        <h2 className="font-headline text-[24px] font-semibold text-on-surface">Pesanan Masuk</h2>
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="Cari ID Pesanan..." 
            className="px-4 py-2 rounded-xl border border-outline-variant/30 text-[13px] focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-soft border border-outline-variant/20 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low border-b border-outline-variant/20">
              <th className="px-6 py-4 text-[13px] font-semibold text-on-surface-variant">ID Pesanan</th>
              <th className="px-6 py-4 text-[13px] font-semibold text-on-surface-variant">Pelanggan</th>
              <th className="px-6 py-4 text-[13px] font-semibold text-on-surface-variant">Produk</th>
              <th className="px-6 py-4 text-[13px] font-semibold text-on-surface-variant">Total</th>
              <th className="px-6 py-4 text-[13px] font-semibold text-on-surface-variant">Status</th>
              <th className="px-6 py-4 text-[13px] font-semibold text-on-surface-variant text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-on-surface-variant text-[14px]">
                  Belum ada pesanan masuk.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="border-b border-outline-variant/10 hover:bg-surface-container-lowest/50 transition-colors">
                  <td className="px-6 py-4 text-[14px] font-medium text-on-surface">{order.id}</td>
                  <td className="px-6 py-4 text-[14px] text-on-surface">
                    <p>{order.customerName}</p>
                    <p className="text-[11px] text-on-surface-variant">{order.date}</p>
                  </td>
                  <td className="px-6 py-4 text-[14px] text-on-surface">{order.productName}</td>
                  <td className="px-6 py-4 text-[14px] font-semibold text-primary">{order.total}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                      order.status === "Menunggu Diproses" 
                        ? "bg-error-container text-error" 
                        : "bg-secondary-container text-secondary"
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {order.status === "Menunggu Diproses" ? (
                      <button 
                        onClick={() => handleProcessOrder(order.id)}
                        className="px-4 py-2 bg-primary text-white rounded-lg text-[12px] font-semibold hover:shadow-soft active:scale-95 transition-all"
                      >
                        Proses
                      </button>
                    ) : (
                      <button className="px-4 py-2 border border-outline-variant/50 text-on-surface-variant rounded-lg text-[12px] font-semibold hover:bg-surface-container transition-all">
                        Lihat Detail
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
