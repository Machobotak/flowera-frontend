"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import ToastContainer from "@/components/toast-container";
import LoadingState from "@/components/ui/loading-state";
import ErrorState from "@/components/ui/error-state";
import OrderDetailModal from "@/components/order-detail-modal";
import { getSellerOrders, getSellerOrderDetail, updateOrderStatus, uploadOrderImage } from "@/utils/seller-order-api";
import { getOrderStatusLabel, getOrderStatusBadgeClass, getNextStatuses, getTransitionLabel, getTransitionIcon, canUploadImage } from "@/utils/order-utils";
import type { SellerOrder, SellerOrderDetail } from "@/types/order";

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

export default function StoreOrdersPage() {
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [sortKey, setSortKey] = useState<string>("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [actionId, setActionId] = useState<number | null>(null);

  // Detail modal state
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<SellerOrderDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Upload image modal state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadOrderId, setUploadOrderId] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadNote, setUploadNote] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const { toasts, addToast, removeToast } = useToast();

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getSellerOrders();
      if (res.status === "success") {
        setOrders(res.data);
      } else {
        setError(res.message || "Gagal memuat data pesanan.");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "Gagal memuat data pesanan."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  /* ──────────────────────────── Transition Order Status ──────────────────────────── */
  const handleTransition = async (orderId: number, targetStatus: string) => {
    setActionId(orderId);
    try {
      const res = await updateOrderStatus(orderId, { status: targetStatus });
      if (res.status === "success") {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId ? { ...o, status: targetStatus } : o
          )
        );
        addToast(res.message || `Status pesanan berhasil diubah!`, "success");
      } else {
        addToast(res.message || "Gagal mengubah status pesanan.", "error");
      }
    } catch (err: any) {
      addToast(
        err.response?.data?.message || err.message || "Gagal mengubah status pesanan.",
        "error"
      );
    } finally {
      setActionId(null);
    }
  };

  /* ──────────────────────────── Upload Image ──────────────────────────── */
  const handleOpenUpload = (orderId: number) => {
    setUploadOrderId(orderId);
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadNote("");
    setUploadModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUploadImage = async () => {
    if (!uploadOrderId || !selectedFile) return;
    setIsUploading(true);
    try {
      const res = await uploadOrderImage(uploadOrderId, selectedFile, uploadNote || undefined);
      if (res.status === "success") {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === uploadOrderId ? { ...o, status: "CONFIRM_USER" } : o
          )
        );
        addToast("Foto berhasil diupload! Menunggu konfirmasi buyer.", "success");
        setUploadModalOpen(false);
      } else {
        addToast(res.message || "Gagal mengupload foto.", "error");
      }
    } catch (err: any) {
      addToast(
        err.response?.data?.message || err.message || "Gagal mengupload foto.",
        "error"
      );
    } finally {
      setIsUploading(false);
    }
  };

  /* ──────────────────────────── View Detail ──────────────────────────── */
  const handleViewDetail = async (orderId: number) => {
    setDetailModalOpen(true);
    setIsLoadingDetail(true);
    setSelectedOrder(null);
    try {
      const res = await getSellerOrderDetail(orderId);
      if (res.status === "success") {
        setSelectedOrder(res.data);
      } else {
        addToast(res.message || "Gagal memuat detail pesanan.", "error");
      }
    } catch (err: any) {
      addToast(
        err.response?.data?.message || err.message || "Gagal memuat detail pesanan.",
        "error"
      );
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleCloseDetail = () => {
    setDetailModalOpen(false);
    setSelectedOrder(null);
  };

  /* ──────────────────────────── Active filters count ──────────────────────────── */
  const activeFilterCount = [statusFilter, dateFrom, dateTo].filter(Boolean).length;

  /* ──────────────────────────── Filtering ──────────────────────────── */
  const filteredOrders = orders.filter((order) => {
    // Search by order number or customer name
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (
        !order.orderNumber.toLowerCase().includes(q) &&
        !order.user_id.name.toLowerCase().includes(q)
      ) {
        return false;
      }
    }

    // Filter by status
    if (statusFilter && order.status !== statusFilter) {
      return false;
    }

    // Filter by date range
    if (dateFrom || dateTo) {
      const orderDate = new Date(order.createdAt);
      orderDate.setHours(0, 0, 0, 0);

      if (dateFrom) {
        const from = new Date(dateFrom);
        from.setHours(0, 0, 0, 0);
        if (orderDate < from) return false;
      }

      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        if (orderDate > to) return false;
      }
    }

    return true;
  });

  /* ──────────────────────────── Sorting ──────────────────────────── */
  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (!sortKey) return 0;

    const getValue = (order: SellerOrder, key: string): string | number => {
      switch (key) {
        case "orderNumber":
          return order.orderNumber;
        case "customer":
          return order.user_id.name.toLowerCase();
        case "total":
          return order.total ?? 0;
        case "status":
          return order.status;
        case "date":
          return order.createdAt;
        default:
          return "";
      }
    };

    const valA = getValue(a, sortKey);
    const valB = getValue(b, sortKey);

    let cmp = 0;
    if (typeof valA === "number" && typeof valB === "number") {
      cmp = valA - valB;
    } else {
      cmp = String(valA).localeCompare(String(valB), "id");
    }
    return sortDir === "asc" ? cmp : -cmp;
  });

  // Extract unique statuses from orders for filter chips
  const availableStatuses = [...new Set(orders.map((o) => o.status))];

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("");
    setDateFrom("");
    setDateTo("");
  };

  /* ──────────────────────────── Loading State ──────────────────────────── */
  if (isLoading) {
    return <LoadingState message="Memuat pesanan..." />;
  }

  /* ──────────────────────────── Error State ──────────────────────────── */
  if (error) {
    return (
      <ErrorState
        onRetry={fetchOrders}
        title="Gagal Memuat Pesanan"
        message={error}
        backHref="/store"
      />
    );
  }

  /* ──────────────────────────── Render ──────────────────────────── */
  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Header */}
      <div>
        <h2 className="font-headline text-[24px] font-semibold text-on-surface">
          Pesanan Masuk
        </h2>
        <p className="text-[13px] text-on-surface-variant mt-1">
          Kelola dan konfirmasi pesanan dari pelanggan Anda.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-soft border border-outline-variant/20 p-4 space-y-3">
        {/* Search + Date Toggle + Reset */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant/60 pointer-events-none">
              search
            </span>
            <input
              type="text"
              placeholder="Cari pesanan atau pelanggan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-outline-variant/30 text-[13px] focus:ring-2 focus:ring-primary/20 focus:border-primary/40 outline-none transition-all bg-surface-container-lowest"
            />
          </div>

          <button
            onClick={() => setShowDateFilter(!showDateFilter)}
            className={`px-4 py-2.5 rounded-xl border text-[13px] font-medium flex items-center gap-2 transition-all ${
              dateFrom || dateTo
                ? "bg-primary-container text-primary border-primary/30"
                : "border-outline-variant/30 text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              date_range
            </span>
            Tanggal
            {(dateFrom || dateTo) && (
              <span className="w-5 h-5 rounded-full bg-primary text-on-primary text-[10px] font-bold flex items-center justify-center">
                {(dateFrom ? 1 : 0) + (dateTo ? 1 : 0)}
              </span>
            )}
          </button>

          {activeFilterCount > 0 && (
            <button
              onClick={handleResetFilters}
              className="px-3 py-2.5 text-[13px] text-error font-medium hover:bg-error-container/30 rounded-xl transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
              Reset
            </button>
          )}
        </div>

        {/* Date Range */}
        {showDateFilter && (
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-outline-variant/10">
            <label className="flex items-center gap-2 text-[13px] text-on-surface-variant">
              Dari
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="px-3 py-2 rounded-xl border border-outline-variant/30 text-[13px] focus:ring-2 focus:ring-primary/20 focus:border-primary/40 outline-none bg-surface-container-lowest"
              />
            </label>
            <label className="flex items-center gap-2 text-[13px] text-on-surface-variant">
              Sampai
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="px-3 py-2 rounded-xl border border-outline-variant/30 text-[13px] focus:ring-2 focus:ring-primary/20 focus:border-primary/40 outline-none bg-surface-container-lowest"
              />
            </label>
            {(dateFrom || dateTo) && (
              <button
                onClick={() => { setDateFrom(""); setDateTo(""); }}
                className="text-[12px] text-on-surface-variant hover:text-error transition-colors"
              >
                Hapus tanggal
              </button>
            )}
          </div>
        )}

        {/* Status Chips */}
        {availableStatuses.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-outline-variant/10">
            <span className="text-[12px] text-on-surface-variant mr-1">Status:</span>
            <button
              onClick={() => setStatusFilter("")}
              className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-all ${
                statusFilter === ""
                  ? "bg-primary text-on-primary shadow-sm"
                  : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
              }`}
            >
              Semua
            </button>
            {availableStatuses.map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status === statusFilter ? "" : status)}
                className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-all ${
                  statusFilter === status
                    ? "bg-primary text-on-primary shadow-sm"
                    : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                {getOrderStatusLabel(status)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-soft border border-outline-variant/20 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low border-b border-outline-variant/20">
              {([
                { key: "orderNumber", label: "ID Pesanan" },
                { key: "customer", label: "Pelanggan" },
                { key: "total", label: "Total" },
                { key: "status", label: "Status" },
              ] as const).map(({ key, label }) => {
                const isActive = sortKey === key;
                return (
                  <th
                    key={key}
                    className="px-6 py-4 text-[13px] font-semibold text-on-surface-variant"
                  >
                    <button
                      onClick={() => handleSort(key)}
                      className="flex items-center gap-1 hover:text-primary transition-colors group cursor-pointer"
                    >
                      {label}
                      <span
                        className={`material-symbols-outlined text-[16px] transition-all ${
                          isActive
                            ? "text-primary"
                            : "text-on-surface-variant/30 group-hover:text-primary/60"
                        }`}
                      >
                        {isActive && sortDir === "asc"
                          ? "arrow_upward"
                          : isActive && sortDir === "desc"
                          ? "arrow_downward"
                          : "swap_vert"}
                      </span>
                    </button>
                  </th>
                );
              })}
              <th className="px-6 py-4 text-[13px] font-semibold text-on-surface-variant text-right">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedOrders.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-on-surface-variant"
                >
                  {searchQuery.trim() || statusFilter || dateFrom || dateTo ? (
                    <div className="flex flex-col items-center gap-3">
                      <span className="material-symbols-outlined text-[40px] text-on-surface-variant/40">
                        filter_alt_off
                      </span>
                      <p className="text-[14px]">
                        Tidak ada pesanan yang cocok dengan filter.
                      </p>
                      <button
                        onClick={handleResetFilters}
                        className="text-[13px] text-primary font-semibold hover:underline"
                      >
                        Reset filter
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <span className="material-symbols-outlined text-[40px] text-on-surface-variant/40">
                        local_mall
                      </span>
                      <p className="text-[14px]">Belum ada pesanan masuk.</p>
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              sortedOrders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-outline-variant/10 hover:bg-surface-container-lowest/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <p className="text-[14px] font-medium text-on-surface">
                      {order.orderNumber}
                    </p>
                    <p className="text-[11px] text-on-surface-variant">
                      {formatDate(order.createdAt)}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-[14px] text-on-surface">
                      {order.user_id.name}
                    </p>
                    <p className="text-[11px] text-on-surface-variant">
                      {order.user_id.email}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-[14px] font-semibold text-primary">
                    {formatCurrency(order.total)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-bold ${getOrderStatusBadgeClass(
                        order.status
                      )}`}
                    >
                      {getOrderStatusLabel(order.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleViewDetail(order.id)}
                        className="px-4 py-2 border border-outline-variant/50 text-on-surface-variant rounded-lg text-[12px] font-semibold hover:bg-surface-container transition-all"
                      >
                        Detail
                      </button>

                      {/* Upload Image button — only when PROSES_PENGERJAAN */}
                      {canUploadImage(order.status) && (
                        <button
                          onClick={() => handleOpenUpload(order.id)}
                          className="px-4 py-2 bg-tertiary text-on-tertiary rounded-lg text-[12px] font-semibold hover:shadow-soft active:scale-95 transition-all flex items-center gap-1.5"
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            add_a_photo
                          </span>
                          Upload Foto
                        </button>
                      )}

                      {/* Dynamic transition buttons */}
                      {getNextStatuses(order.status).map((targetStatus) => (
                        <button
                          key={targetStatus}
                          onClick={() => handleTransition(order.id, targetStatus)}
                          disabled={actionId === order.id}
                          className="px-4 py-2 bg-primary text-white rounded-lg text-[12px] font-semibold hover:shadow-soft active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                        >
                          {actionId === order.id ? (
                            <>
                              <span className="material-symbols-outlined animate-spin text-[14px]">
                                progress_activity
                              </span>
                              Memproses...
                            </>
                          ) : (
                            <>
                              <span className="material-symbols-outlined text-[14px]">
                                {getTransitionIcon(targetStatus)}
                              </span>
                              {getTransitionLabel(targetStatus)}
                            </>
                          )}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Order Count */}
      {sortedOrders.length > 0 && (
        <p className="text-[12px] text-on-surface-variant text-right">
          Menampilkan {sortedOrders.length} dari {orders.length} pesanan
        </p>
      )}

      {/* Upload Image Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm animate-[fadeIn_0.15s_ease]"
            onClick={() => !isUploading && setUploadModalOpen(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md animate-[slideUp_0.2s_ease]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant/20">
              <h3 className="font-headline text-[18px] font-bold text-on-surface">
                Upload Foto Buket
              </h3>
              <button
                onClick={() => setUploadModalOpen(false)}
                disabled={isUploading}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[20px] text-on-surface-variant">
                  close
                </span>
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4">
              <p className="text-[13px] text-on-surface-variant">
                Upload foto buket yang sudah jadi untuk dikonfirmasi oleh pembeli.
              </p>

              {/* File picker */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-outline-variant/40 rounded-xl p-6 text-center cursor-pointer hover:border-primary/60 transition-colors"
              >
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="max-h-48 mx-auto rounded-lg object-contain" />
                ) : (
                  <div className="space-y-2">
                    <span className="material-symbols-outlined text-[36px] text-on-surface-variant">
                      add_a_photo
                    </span>
                    <p className="text-[13px] text-on-surface-variant">
                      Klik untuk pilih foto buket
                    </p>
                    <p className="text-[11px] text-outline">JPG, PNG, atau WebP</p>
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
              <div className="space-y-1.5">
                <label className="text-[12px] font-semibold text-on-surface-variant">
                  Catatan <span className="font-normal text-outline">(opsional)</span>
                </label>
                <input
                  type="text"
                  value={uploadNote}
                  onChange={(e) => setUploadNote(e.target.value)}
                  placeholder="Misal: Buket sudah jadi sesuai pesanan"
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[13px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-outline-variant/20 flex justify-end gap-3">
              <button
                onClick={() => setUploadModalOpen(false)}
                disabled={isUploading}
                className="px-5 py-2.5 border border-outline-variant/40 text-on-surface font-semibold text-[14px] rounded-xl hover:bg-surface-container transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleUploadImage}
                disabled={!selectedFile || isUploading}
                className="px-5 py-2.5 bg-primary text-white font-semibold text-[14px] rounded-xl hover:shadow-soft active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Mengupload...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
                    Upload
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <OrderDetailModal
        isOpen={detailModalOpen}
        order={selectedOrder}
        isLoading={isLoadingDetail}
        onClose={handleCloseDetail}
      />
    </div>
  );
}
