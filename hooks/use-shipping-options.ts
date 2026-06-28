"use client";

import { useState } from "react";
import { getShippingOptions } from "@/utils/checkout-api";
import type { AvailableShipping, ShippingOption } from "@/types/checkout";

interface CheckoutItemInput {
  product_id: number;
  product_variant_id?: number;
  qty: number;
  weight_gram: number;
  store_id: number;
  price: number;
}

export function useShippingOptions() {
  const [shippingOptionsByStore, setShippingOptionsByStore] = useState<Record<number, AvailableShipping[]>>({});
  const [shippingOptionsLoading, setShippingOptionsLoading] = useState(false);
  const [selectedShipping, setSelectedShipping] = useState<Record<number, ShippingOption>>({});
  const [courierModalStoreId, setCourierModalStoreId] = useState<number | null>(null);

  async function fetchShippingOptions(
    selectedAddressId: number | null,
    orderItems: CheckoutItemInput[]
  ) {
    if (!selectedAddressId) return;

    setShippingOptionsLoading(true);
    try {
      const payloadItems = orderItems.map((item) => ({
        product_id: item.product_id,
        product_variant_id: item.product_variant_id,
        quantity: item.qty,
        weight_gram: item.weight_gram,
        store_id: item.store_id,
        price: item.price,
        courier_name: "-",
        courier_service: "-",
        shipping_etd: "-",
        shipping_cost: 0,
      }));

      const data = await getShippingOptions({
        address_id: selectedAddressId,
        courier: "placeholder",
        shipping: [],
        order_items: payloadItems,
      });

      const results: Record<number, AvailableShipping[]> = {};
      for (const store of data) {
        results[store.store_id] = store.shipping.map((s) => ({
          courier_name: s.name,
          courier_code: s.code,
          courier_service: s.service,
          shipping_cost: s.cost,
          shipping_etd: s.etd,
        }));
      }

      setShippingOptionsByStore(results);

      // Auto-select cheapest per store
      const autoSelected: Record<number, ShippingOption> = {};
      for (const [storeId, opts] of Object.entries(results)) {
        const cheapest = opts.reduce<AvailableShipping | null>((best, cur) => {
          if (!best || cur.shipping_cost < best.shipping_cost) return cur;
          return best;
        }, null);
        if (cheapest) {
          autoSelected[Number(storeId)] = { ...cheapest, store_id: Number(storeId) };
        }
      }
      setSelectedShipping(autoSelected);
    } catch {
      // error handled by caller via hook consumer
    } finally {
      setShippingOptionsLoading(false);
    }
  }

  function handleShippingSelect(storeId: number, option: AvailableShipping) {
    setSelectedShipping((prev) => ({
      ...prev,
      [storeId]: { ...option, store_id: storeId },
    }));
  }

  return {
    shippingOptionsByStore,
    shippingOptionsLoading,
    selectedShipping,
    courierModalStoreId,
    setCourierModalStoreId,
    fetchShippingOptions,
    handleShippingSelect,
    setSelectedShipping,
  };
}
