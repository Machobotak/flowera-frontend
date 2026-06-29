"use client";

import { useState } from "react";
import { checkoutPreview, checkout } from "@/utils/checkout-api";
import { buildOrderItemsPayload, buildCourierString, buildShippingArray } from "@/utils/checkout-payload";
import type { StoreBreakdown, ShippingOption, CheckoutData } from "@/types/checkout";

interface CheckoutItemInput {
  product_id: number;
  product_variant_id?: number;
  qty: number;
  weight_gram: number;
  store_id: number;
  price: number;
  addon_product?: string;
}

export function useCheckoutFlow() {
  const [previewData, setPreviewData] = useState<StoreBreakdown[] | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<CheckoutData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function verifyCheckoutPreview(
    selectedAddressId: number | null,
    orderItems: CheckoutItemInput[],
    selectedShipping: Record<number, ShippingOption>
  ): Promise<boolean> {
    if (!selectedAddressId) return false;

    setPreviewLoading(true);
    setErrorMsg(null);
    try {
      const payloadItems = buildOrderItemsPayload(orderItems, selectedShipping);
      const courier = buildCourierString(selectedShipping);
      const shippingArray = buildShippingArray(selectedShipping);

      const res = await checkoutPreview({
        address_id: selectedAddressId,
        discount: 0,
        courier,
        shipping: shippingArray,
        order_items: payloadItems,
      });

      if (res.status === "success") {
        setPreviewData(res.data.stores);
        return true;
      }
      return false;
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || "Gagal verifikasi pesanan");
      return false;
    } finally {
      setPreviewLoading(false);
    }
  }

  async function placeOrder(
    selectedAddressId: number | null,
    orderItems: CheckoutItemInput[],
    selectedShipping: Record<number, ShippingOption>,
    paymentMethod: string,
    orderNote: string,
    isGift: boolean,
    giftMessage: string
  ) {
    if (!selectedAddressId) return;

    setIsPlacingOrder(true);
    setErrorMsg(null);
    try {
      const payloadItems = buildOrderItemsPayload(orderItems, selectedShipping);
      const courier = buildCourierString(selectedShipping);
      const shippingArray = buildShippingArray(selectedShipping);

      const noteParts: string[] = [];
      if (orderNote) noteParts.push(orderNote);
      if (isGift && giftMessage) noteParts.push(`[Hadiah] ${giftMessage}`);

      const res = await checkout({
        address_id: selectedAddressId,
        discount: 0,
        paymentMethod,
        note: noteParts.join(" | ") || undefined,
        courier,
        shipping: shippingArray,
        order_items: payloadItems,
      });

      if (res.status === "success") {
        sessionStorage.removeItem("directCheckoutItems");
        setCreatedOrder(res.data);
        return res.data;
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || "Gagal membuat pesanan");
    } finally {
      setIsPlacingOrder(false);
    }
  }

  return {
    previewData,
    previewLoading,
    isPlacingOrder,
    createdOrder,
    errorMsg,
    setErrorMsg,
    verifyCheckoutPreview,
    placeOrder,
  };
}
