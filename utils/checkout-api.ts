/**
 * Centralized API functions for checkout endpoints.
 * Calls the backend directly via NEXT_PUBLIC_API_URL.
 *
 * Endpoints:
 *   POST /api/user/order/checkout-preview  → preview order with shipping options
 *   POST /api/user/order/checkout          → place the order
 */

import axios from "axios";
import type {
  CheckoutPreviewPayload,
  CheckoutPreviewResponse,
  CheckoutPayload,
  CheckoutResponse,
  ShippingOptionsPayload,
  StoreShippingOption,
} from "@/types/checkout";

const BASE = "/api/user/order";

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

/* ──────────────────────────── Checkout Preview ──────────────────────────── */

export async function checkoutPreview(
  payload: CheckoutPreviewPayload
): Promise<CheckoutPreviewResponse> {
  const res = await axios.post<CheckoutPreviewResponse>(
    `${BASE}/checkout-preview`,
    payload,
    authConfig()
  );
  return res.data;
}

/* ──────────────────────────── Shipping Options ──────────────────────────── */

/**
 * Get available shipping options per store based on address and order items.
 * Automatically groups by store and returns sorted courier options.
 */
export async function getShippingOptions(
  payload: ShippingOptionsPayload
): Promise<StoreShippingOption[]> {
  const res = await axios.post<StoreShippingOption[]>(
    `${BASE}/shipping-options`,
    payload,
    authConfig()
  );
  return res.data;
}

/* ──────────────────────────── Place Order ──────────────────────────── */

export async function checkout(
  payload: CheckoutPayload
): Promise<CheckoutResponse> {
  const res = await axios.post<CheckoutResponse>(
    `${BASE}/checkout`,
    payload,
    authConfig()
  );
  return res.data;
}
