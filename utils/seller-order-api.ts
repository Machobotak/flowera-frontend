/**
 * Centralized API functions for seller order endpoints.
 * Calls the backend directly via NEXT_PUBLIC_API_URL to avoid Next.js rewrite issues.
 */

import axios from "axios";
import type {
  SellerOrderListResponse,
  SellerOrderDetailResponse,
  UpdateOrderStatusPayload,
  UpdateOrderStatusResponse,
  UploadOrderImageResponse,
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

/* ──────────────────────────── Get Seller Orders ──────────────────────────── */

export async function getSellerOrders(): Promise<SellerOrderListResponse> {
  const res = await axios.get<SellerOrderListResponse>(
    `${API_BASE}/api/seller/order`,
    authConfig()
  );
  return res.data;
}

/* ──────────────────────────── Get Order Detail ──────────────────────────── */

export async function getSellerOrderDetail(
  orderId: number
): Promise<SellerOrderDetailResponse> {
  const res = await axios.get<SellerOrderDetailResponse>(
    `${API_BASE}/api/seller/order/${orderId}`,
    authConfig()
  );
  return res.data;
}

/* ──────────────────────────── Update Order Status ──────────────────────────── */

export async function updateOrderStatus(
  orderId: number,
  payload: UpdateOrderStatusPayload
): Promise<UpdateOrderStatusResponse> {
  const res = await axios.patch<UpdateOrderStatusResponse>(
    `${API_BASE}/api/seller/order/${orderId}/status`,
    payload,
    authConfig()
  );
  return res.data;
}

/* ──────────────────────────── Upload Order Image ──────────────────────────── */

export async function uploadOrderImage(
  orderId: number,
  file: File,
  note?: string
): Promise<UploadOrderImageResponse> {
  const formData = new FormData();
  formData.append("file", file);
  if (note) formData.append("note", note);

  const res = await axios.post<UploadOrderImageResponse>(
    `${API_BASE}/api/seller/order/${orderId}/upload-image`,
    formData,
    authConfig()
  );
  return res.data;
}
