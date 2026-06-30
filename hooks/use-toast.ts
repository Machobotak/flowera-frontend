"use client";

import { useState, useCallback, useRef } from "react";

export interface Toast {
  id: number;
  message: string;
  type: "error" | "success" | "info";
}

let globalId = 0;

/**
 * Shared toast hook — pasang di tiap halaman seller.
 * Return: { toasts, addToast, removeToast }
 */
export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const addToast = useCallback((message: string, type: Toast["type"] = "error") => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
}
