/**
 * Order status display utilities.
 * Maps backend status values to Indonesian labels and badge color classes.
 */

/** Fixed service fee applied to every order (matches backend SERVICE_FEE) */
export const SERVICE_FEE = 1000;

/** Derive the service fee from order fields (total - items - shipping + discount). Falls back to SERVICE_FEE constant. */
export function deriveServiceFee(order: {
  total: number | null;
  items_total?: number | null;
  shipping_total?: number | null;
  discount?: number | null;
}): number {
  if (
    order.total != null &&
    order.items_total != null &&
    order.shipping_total != null
  ) {
    const fee = order.total - order.items_total - order.shipping_total + (order.discount ?? 0);
    return fee > 0 ? fee : SERVICE_FEE;
  }
  return SERVICE_FEE;
}

const ORDER_STATUS_MAP: Record<string, { label: string; badgeClass: string }> = {
  UNPAID: {
    label: "Menunggu Pembayaran",
    badgeClass: "bg-tertiary-container text-on-tertiary-container",
  },
  PAID: {
    label: "Menunggu Konfirmasi",
    badgeClass: "bg-error-container text-error",
  },
  CONFIRM_SELLER: {
    label: "Dikonfirmasi Penjual",
    badgeClass: "bg-secondary-container text-secondary",
  },
  PROSES_PENGERJAAN: {
    label: "Sedang Dikerjakan",
    badgeClass: "bg-tertiary-container text-on-tertiary-container",
  },
  CONFIRM_USER: {
    label: "Menunggu Konfirmasi Buyer",
    badgeClass: "bg-error-container text-error",
  },
  DELIVERY: {
    label: "Dalam Pengiriman",
    badgeClass: "bg-primary-container text-primary",
  },
  DITERIMA: {
    label: "Diterima",
    badgeClass: "bg-secondary-container text-on-secondary-container",
  },
  SHIPPED: {
    label: "Dikirim",
    badgeClass: "bg-primary-container text-primary",
  },
  DELIVERED: {
    label: "Terkirim",
    badgeClass: "bg-secondary-container text-on-secondary-container",
  },
  EXPIRED: {
    label: "Kedaluwarsa",
    badgeClass: "bg-surface-container-high text-on-surface-variant",
  },
  CANCELLED: {
    label: "Dibatalkan",
    badgeClass: "bg-error-container text-error",
  },
};

const DEFAULT_STATUS = {
  label: "Tidak Diketahui",
  badgeClass: "bg-surface-container-high text-on-surface-variant",
};

/* ──────────────────────────── Valid Transition Map ──────────────────────────── */

/** Maps a status to the list of valid NEXT statuses (from backend updateStatus validation) */
const VALID_TRANSITIONS: Record<string, string[]> = {
  UNPAID: [],
  PAID: ["CONFIRM_SELLER"],
  CONFIRM_SELLER: ["PROSES_PENGERJAAN"],
  PROSES_PENGERJAAN: ["DELIVERY"],
  DELIVERY: [],
  DITERIMA: [],
};

/** Human-readable label for each transition action */
const TRANSITION_LABELS: Record<string, string> = {
  CONFIRM_SELLER: "Konfirmasi Pesanan",
  PROSES_PENGERJAAN: "Proses Pengerjaan",
  DELIVERY: "Kirim Pesanan",
  DITERIMA: "Pesanan Diterima",
};

/** Icon for each transition action */
const TRANSITION_ICONS: Record<string, string> = {
  CONFIRM_SELLER: "check",
  PROSES_PENGERJAAN: "handyman",
  DELIVERY: "local_shipping",
  DITERIMA: "package_2",
};

/* ──────────────────────────── Seller Helpers ──────────────────────────── */

/** Get the display label for an order status */
export function getOrderStatusLabel(status: string): string {
  return ORDER_STATUS_MAP[status]?.label ?? status;
}

/** Get the Tailwind badge classes for an order status */
export function getOrderStatusBadgeClass(status: string): string {
  return ORDER_STATUS_MAP[status]?.badgeClass ?? DEFAULT_STATUS.badgeClass;
}

/** Get list of valid next statuses from current status */
export function getNextStatuses(status: string): string[] {
  return VALID_TRANSITIONS[status] ?? [];
}

/** Get label for a transition target */
export function getTransitionLabel(targetStatus: string): string {
  return TRANSITION_LABELS[targetStatus] ?? targetStatus;
}

/** Get icon for a transition target */
export function getTransitionIcon(targetStatus: string): string {
  return TRANSITION_ICONS[targetStatus] ?? "arrow_forward";
}

/** Check if seller can upload proof image for this order */
export function canUploadImage(status: string): boolean {
  return status === "PROSES_PENGERJAAN";
}

/** @deprecated Use getNextStatuses instead */
export function canConfirmOrder(status: string): boolean {
  return getNextStatuses(status).includes("CONFIRM_SELLER");
}

/* ──────────────────────────── Buyer-side mappings ──────────────────────────── */

/** Maps backend status to buyer filter tab keys */
export function getBuyerFilterKey(status: string): string {
  const map: Record<string, string> = {
    UNPAID: "pending",
    PAID: "paid",
    CONFIRM_SELLER: "processing",
    PROSES_PENGERJAAN: "processing",
    CONFIRM_USER: "processing",
    DELIVERY: "shipped",
    DITERIMA: "completed",
    PROCESSED: "processing",
    SHIPPED: "shipped",
    DELIVERED: "completed",
    COMPLETED: "completed",
    CANCELLED: "cancelled",
    EXPIRED: "cancelled",
  };
  return map[status] || status;
}

/** Buyer-side status label */
export function getBuyerStatusLabel(status: string): string {
  const map: Record<string, string> = {
    UNPAID: "Menunggu Pembayaran",
    PAID: "Sudah Dibayar",
    CONFIRM_SELLER: "Dikonfirmasi Penjual",
    PROSES_PENGERJAAN: "Sedang Dikerjakan",
    CONFIRM_USER: "Menunggu Konfirmasi",
    DELIVERY: "Dalam Pengiriman",
    DITERIMA: "Selesai",
    PROCESSED: "Diproses",
    SHIPPED: "Dikirim",
    DELIVERED: "Selesai",
    COMPLETED: "Selesai",
    CANCELLED: "Dibatalkan",
    EXPIRED: "Kedaluwarsa",
  };
  return map[status] || status;
}
