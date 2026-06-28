"use client";

import { useState } from "react";
import { getPaymentStatus } from "@/utils/payment-api";
import type { CheckoutData } from "@/types/checkout";

export function usePaymentStatus() {
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [qrLightbox, setQrLightbox] = useState(false);

  function setQrFromCheckout(data: CheckoutData | null) {
    if (data?.payment?.qr_url) {
      setQrUrl(data.payment.qr_url);
    }
    if (data?.payment?.status) {
      setPaymentStatus(data.payment.status);
    }
  }

  async function checkPaymentStatus(createdOrder: CheckoutData | null) {
    const orderNumber = createdOrder?.orderNumber || (createdOrder as any)?.order_number;
    if (!orderNumber) return;

    setIsCheckingPayment(true);
    try {
      const res = await getPaymentStatus(orderNumber);
      if (res.status === "success") {
        setQrUrl((prev) => res.data.qr_url || prev);
        setPaymentStatus(res.data.payment_status);
      }
    } catch {
      // ignore
    } finally {
      setIsCheckingPayment(false);
    }
  }

  return {
    qrUrl,
    paymentStatus,
    isCheckingPayment,
    qrLightbox,
    setQrLightbox,
    setQrFromCheckout,
    checkPaymentStatus,
  };
}
