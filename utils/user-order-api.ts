/**
 * Centralized API functions for buyer order endpoints.
 * Calls the backend directly via NEXT_PUBLIC_API_URL to avoid Next.js rewrite issues.
 */

import axios from "axios";
import type {
  UserOrderListResponse,
  ConfirmOrderImagePayload,
  ConfirmOrderImageResponse,
} from "@/types/order";

const API_BASE = "";

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

/* ──────────────────────────── Get Buyer Orders ──────────────────────────── */

export async function getBuyerOrders(): Promise<UserOrderListResponse> {
  const res = await axios.get<UserOrderListResponse>(
    `${API_BASE}/api/user/order`,
    authConfig()
  );
  return res.data;
}

/* ──────────────────────────── Confirm Order Image ──────────────────────────── */

export async function confirmReceived(
  orderId: number
): Promise<ConfirmOrderImageResponse> {
  const res = await axios.patch<ConfirmOrderImageResponse>(
    `${API_BASE}/api/user/order/${orderId}/confirm-received`,
    {},
    authConfig()
  );
  return res.data;
}

export async function confirmOrderImage(
  orderImageId: number,
  payload: ConfirmOrderImagePayload
): Promise<ConfirmOrderImageResponse> {
  const res = await axios.patch<ConfirmOrderImageResponse>(
    `${API_BASE}/api/user/order/image/${orderImageId}/confirm`,
    payload,
    authConfig()
  );
  return res.data;
}
