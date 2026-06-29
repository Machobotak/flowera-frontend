/**
 * Types for checkout endpoints.
 *
 *   POST /api/user/order/checkout-preview  → preview order with shipping options
 *   POST /api/user/order/checkout          → place the order
 */

/* ──────────────────────────── Order Items ──────────────────────────── */

/** Single order item for checkout-preview */
export interface CheckoutOrderItem {
  product_id: number;
  product_variant_id?: number;
  quantity: number;
  store_id: number;
  price: number;
}

/** Single order item for checkout (includes weight, price, and inline shipping) */
export interface CheckoutOrderItemWithWeight extends CheckoutOrderItem {
  weight_gram: number;
  price: number;
  courier_name: string;
  courier_service: string;
  shipping_etd: string;
  shipping_cost: number;
}

/* ──────────────────────────── Shipping ──────────────────────────── */

export interface ShippingOption {
  store_id: number;
  courier_name: string;
  courier_code: string;
  courier_service: string;
  shipping_cost: number;
  shipping_etd: string;
}

/* ──────────────────────────── Checkout Preview ──────────────────────────── */

export interface CheckoutPreviewPayload {
  address_id: number;
  discount?: number;
  courier: string;
  shipping: any[];
  order_items: CheckoutOrderItemWithWeight[];
}

/** Per-store breakdown returned by the preview endpoint */
export interface StoreBreakdown {
  store_id: number;
  store_name?: string;
  items: CheckoutPreviewItem[];
  available_shipping: AvailableShipping[];
  subtotal: number;
}

export interface CheckoutPreviewItem {
  product_id: number;
  product_variant_id?: number;
  product_name: string;
  variant_name?: string;
  product_image?: string;
  quantity: number;
  price: number;
  weight_gram: number;
}

export interface AvailableShipping {
  courier_name: string;
  courier_code: string;
  courier_service: string;
  shipping_cost: number;
  shipping_etd: string;
}

export interface CheckoutPreviewData {
  stores: StoreBreakdown[];
  total: number;
  discount: number;
  grand_total: number;
  items?: unknown[];
  shipping_options?: unknown[];
  summary?: {
    items_total: number;
    service_fee: number;
    discount: number;
    estimated_total: number;
  };
}

export interface CheckoutPreviewResponse {
  status: string;
  data: CheckoutPreviewData;
  message?: string;
}

/* ──────────────────────────── Checkout (Place Order) ──────────────────────────── */

export interface CheckoutPayload {
  address_id: number;
  discount?: number;
  paymentMethod: string;
  note?: string;
  courier: string;
  shipping: any[];
  order_items: CheckoutOrderItemWithWeight[];
}

export interface CheckoutData {
  id?: number;
  order_id?: number;
  orderNumber?: string;
  order_number?: string;
  total: number;
  status: string;
  payment?: {
    transaction_id: string;
    status: string;
    qr_url?: string;
    qr_string?: string;
  };
  paymentUrl?: string;
  paymentMethod?: string;
  createdAt?: string;
}

export interface CheckoutResponse {
  status: string;
  data: CheckoutData;
  message?: string;
}

/* ──────────────────────────── Shipping Options ──────────────────────────── */

export interface ShippingOptionsPayload {
  address_id: number;
  courier?: string;
  shipping?: any[];
  order_items: {
    product_id: number;
    product_variant_id?: number;
    quantity: number;
    weight_gram: number;
    store_id: number;
    price?: number;
    courier_name?: string;
    courier_service?: string;
    shipping_etd?: string;
    shipping_cost?: number;
  }[];
}

export interface ShippingOptionItem {
  name: string;
  code: string;
  service: string;
  description: string;
  cost: number;
  etd: string;
}

export interface StoreShippingOption {
  store_id: number;
  weight: number;
  shipping: ShippingOptionItem[];
}
