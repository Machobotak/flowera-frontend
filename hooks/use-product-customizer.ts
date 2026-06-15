"use client";

import { useState, useCallback, useMemo } from "react";
import type { FlowerType, WrappingColor, AccessoryState, TouchState } from "@/types/product";
import { FLOWER_OPTIONS, BASE_PRICE } from "@/data/product";

/* ──────────────────────────── Initial State ──────────────────────────── */

const INITIAL_ACCESSORIES: Record<string, AccessoryState> = {
  teddy: { qty: 0, price: 15, name: "Teddy Bear" },
  balloon: { qty: 0, price: 5, name: "Balloons" },
};

const INITIAL_TOUCHES: Record<string, TouchState> = {
  lights: { active: false, price: 8, name: "LED Lights" },
  card: { active: false, price: 5, name: "Greeting Card" },
};

/* ──────────────────────────── Hook ──────────────────────────── */

export function useProductCustomizer() {
  const [selectedFlower, setSelectedFlower] = useState<FlowerType>("roses");
  const [selectedColor, setSelectedColor] = useState<WrappingColor>("#3a6847");
  const [imageOpacity, setImageOpacity] = useState(1);
  const [accessories, setAccessories] =
    useState<Record<string, AccessoryState>>(INITIAL_ACCESSORIES);
  const [touches, setTouches] =
    useState<Record<string, TouchState>>(INITIAL_TOUCHES);

  // Derived values
  const currentFlowerOption = useMemo(
    () => FLOWER_OPTIONS.find((f) => f.type === selectedFlower) ?? FLOWER_OPTIONS[0],
    [selectedFlower]
  );

  const currentImage = currentFlowerOption.image || FLOWER_OPTIONS[0].image;

  const flowerCost = currentFlowerOption.extra;

  const accessoryCost = useMemo(
    () => Object.values(accessories).reduce((sum, a) => sum + a.qty * a.price, 0),
    [accessories]
  );

  const touchCost = useMemo(
    () => Object.values(touches).reduce((sum, t) => sum + (t.active ? t.price : 0), 0),
    [touches]
  );

  const total = BASE_PRICE + flowerCost + accessoryCost + touchCost;

  // Handlers
  const handleFlowerChange = useCallback((type: FlowerType) => {
    setImageOpacity(0.7);
    setTimeout(() => {
      setSelectedFlower(type);
      setImageOpacity(1);
    }, 200);
  }, []);

  const handleQtyChange = useCallback((item: string, delta: number) => {
    setAccessories((prev) => ({
      ...prev,
      [item]: {
        ...prev[item],
        qty: Math.max(0, prev[item].qty + delta),
      },
    }));
  }, []);

  const handleToggleTouch = useCallback((item: string) => {
    setTouches((prev) => ({
      ...prev,
      [item]: {
        ...prev[item],
        active: !prev[item].active,
      },
    }));
  }, []);

  return {
    // State
    selectedFlower,
    selectedColor,
    setSelectedColor,
    imageOpacity,
    accessories,
    touches,

    // Derived
    currentFlowerOption,
    currentImage,
    flowerCost,
    accessoryCost,
    touchCost,
    total,

    // Handlers
    handleFlowerChange,
    handleQtyChange,
    handleToggleTouch,
  };
}
