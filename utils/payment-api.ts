/**
 * Centralized API functions for payment endpoints.
 *
 * Endpoints:
 *   GET /api/payment/status/:orderId  → check payment status
 */

import axios from "axios";

const BASE = "/api/payment";

/** Build axios config with Bearer token from localStorage */
function authConfig() {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("accessToken")
      : null;
  return {
    withCredentials: true,
    ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
  };
}

/* ──────────────────────────── Payment Status ──────────────────────────── */

export interface PaymentStatusData {
  payment_status: string;
  order_status: string;
  qr_url?: string;
  expired_at?: string;
}

export interface PaymentStatusResponse {
  status: string;
  data: PaymentStatusData;
}

export async function getPaymentStatus(
  orderId: string
): Promise<PaymentStatusResponse> {
  const res = await axios.get<PaymentStatusResponse>(
    `${BASE}/status/${orderId}`,
    authConfig()
  );
  return res.data;
}
