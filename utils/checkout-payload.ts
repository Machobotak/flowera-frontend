/**
 * Shared checkout payload builders.
 * Used by verifyCheckoutPreview + placeOrder to avoid duplication.
 */

import type {
  CheckoutOrderItemWithWeight,
  ShippingOption,
} from "@/types/checkout";

/** Input shape — matches CheckoutItem from checkout page */
export interface CheckoutItemInput {
  product_id: number;
  product_variant_id?: number;
  qty: number;
  weight_gram: number;
  store_id: number;
  price: number;
}

export function buildOrderItemsPayload(
  orderItems: CheckoutItemInput[],
  selectedShipping: Record<number, ShippingOption>
): CheckoutOrderItemWithWeight[] {
  return orderItems.map((item) => {
    const ship = selectedShipping[item.store_id];
    return {
      product_id: item.product_id,
      product_variant_id: item.product_variant_id,
      quantity: item.qty,
      weight_gram: item.weight_gram,
      store_id: item.store_id,
      price: item.price,
      courier_name: ship?.courier_name || "-",
      courier_service: ship?.courier_service || "-",
      shipping_etd: ship?.shipping_etd || "-",
      shipping_cost: ship?.shipping_cost || 0,
    };
  });
}

export function buildCourierString(
  selectedShipping: Record<number, ShippingOption>
): string {
  const courierCodes = Object.values(selectedShipping)
    .map((s) => s.courier_code)
    .filter(Boolean);
  return [...new Set(courierCodes)].join(":") || "placeholder";
}

export function buildShippingArray(
  selectedShipping: Record<number, ShippingOption>
) {
  return Object.values(selectedShipping).map((s) => ({
    store_id: s.store_id,
    courier_name: s.courier_name,
    courier_code: s.courier_code,
    courier_service: s.courier_service,
    shipping_cost: s.shipping_cost,
    shipping_etd: s.shipping_etd,
  }));
}
