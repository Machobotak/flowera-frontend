"use client";

import { useState, useEffect, useMemo } from "react";
import { getAddresses } from "@/utils/address-api";
import type { UserAddress } from "@/types/address";

export function useAddresses() {
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);

  useEffect(() => {
    async function fetchAddresses() {
      setAddressesLoading(true);
      try {
        const res = await getAddresses();
        if (res.status === "success") {
          setAddresses(res.data);
          if (res.data.length > 0) {
            setSelectedAddressId(res.data[0].id);
          }
        }
      } catch (err: any) {
        console.error("Failed to load addresses:", err);
      } finally {
        setAddressesLoading(false);
      }
    }
    fetchAddresses();
  }, []);

  const selectedAddress = useMemo(
    () => addresses.find((a) => a.id === selectedAddressId),
    [addresses, selectedAddressId]
  );

  return {
    addresses,
    addressesLoading,
    selectedAddressId,
    selectedAddress,
    setSelectedAddressId,
  };
}
