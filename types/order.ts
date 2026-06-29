/**
 * Types for seller and buyer order endpoints.
 *
 * Seller:
 *   GET   /api/seller/order          → list all orders for seller
 *   GET   /api/seller/order/:id      → get order detail
 *   PATCH /api/seller/order/:id/status → update order status
 *
 * Buyer:
 *   GET   /api/user/order                  → list buyer's orders
 *   PATCH /api/user/order/image/:id/confirm → confirm/reject order image
 */

/* ──────────────────────────── Embedded Entities ──────────────────────────── */

export interface OrderUser {
  id: number;
  name: string;
  phone_number?: string;
  email: string;
  avatar?: string | null;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface OrderProduct {
  id: number;
  name: string;
  slug: string;
  description?: string;
  rating: number;
  isLifeFlower: number;
  price: number;
  weight: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface OrderProductVariant {
  id: number;
  title: string;
  subTitle: string;
  price: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface OrderStore {
  id: number;
  name: string;
  slug: string;
  logo?: string;
  address: string;
  type: string;
  description?: string;
  rating: number;
  city: string;
  province_name: string;
  city_name: string;
  district_name: string;
  subdistrict_name: string;
  zip_code: string;
  subdistrict_id: string;
  dateOnlineLast?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

/* ──────────────────────────── Order Item ──────────────────────────── */

export interface OrderItem {
  id: number;
  quantity: number;
  price: number | null;
  subTotal: number | null;
  discount: number | null;
  courier_name: string | null;
  courier_service: string | null;
  shipping_cost: number | null;
  shipping_etd: string | null;
  product_id: OrderProduct;
  addon_product: unknown | null;
  product_variant_id: OrderProductVariant | null;
  store_id: OrderStore;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

/* ──────────────────────────── Order (List) ──────────────────────────── */

/** Brief user info embedded in list response */
export interface OrderListUser {
  id: number;
  name: string;
  email: string;
}

/** Single order in the list response */
export interface SellerOrder {
  id: number;
  user_id: OrderListUser;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
}

/* ──────────────────────────── Order (Detail) ──────────────────────────── */

/** Full order detail */
export interface SellerOrderDetail {
  id: number;
  user_id: OrderUser;
  orderNumber: string;
  status: string;
  total: number | null;
  discount: number | null;
  items_total: number | null;
  shipping_total: number | null;
  isCustomerConfirmed: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  order_image_confirmed: unknown[];
  order_item: OrderItem[];
}

/* ──────────────────────────── API Responses ──────────────────────────── */

export interface SellerOrderListResponse {
  status: string;
  data: SellerOrder[];
  message?: string;
}

export interface SellerOrderDetailResponse {
  status: string;
  data: SellerOrderDetail;
  message?: string;
}

export interface UpdateOrderStatusResponse {
  status: string;
  message: string;
}

/* ──────────────────────────── Payloads ──────────────────────────── */

export interface UpdateOrderStatusPayload {
  status: string;
}

/* ──────────────────────────── Buyer Order Types ──────────────────────────── */

/** Full order returned by GET /api/user/order (same shape as SellerOrderDetail) */
export type UserOrder = SellerOrderDetail;

export interface UserOrderListResponse {
  status: string;
  data: UserOrder[];
  message?: string;
}

/** Payload for confirming/rejecting an order image */
export interface ConfirmOrderImagePayload {
  status: "CONFIRMED" | "REJECTED";
  reply_note?: string;
}

export interface ConfirmOrderImageResponse {
  status: string;
  message: string;
}

/* ──────────────────────────── Upload Order Image ──────────────────────────── */

export interface UploadOrderImageResponse {
  status: string;
  message: string;
  data?: {
    image_url: string;
  };
}
