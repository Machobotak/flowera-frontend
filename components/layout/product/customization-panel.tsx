import React from "react";
import type { FlowerType, WrappingColor, AccessoryState, TouchState } from "@/types/product";
import { FLOWER_OPTIONS, WRAPPING_COLORS } from "@/data/product";

/* ──────────────────────────── Props ──────────────────────────── */

interface CustomizationPanelProps {
  selectedFlower: FlowerType;
  selectedColor: WrappingColor;
  accessories: Record<string, AccessoryState>;
  touches: Record<string, TouchState>;
  onFlowerChange: (type: FlowerType) => void;
  onColorChange: (color: WrappingColor) => void;
  onQtyChange: (item: string, delta: number) => void;
  onToggleTouch: (item: string) => void;
}

/* ──────────────────────────── Sub‑components ──────────────────────────── */

function FlowerSelector({
  selectedFlower,
  onFlowerChange,
}: Pick<CustomizationPanelProps, "selectedFlower" | "onFlowerChange">) {
  return (
    <div>
      <h3 className="font-body text-[14px] leading-5 tracking-[0.05em] font-semibold text-on-surface mb-4">
        1. Select Main Flowers
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {FLOWER_OPTIONS.map((flower) => (
          <button
            key={flower.type}
            className={`p-3 border-2 rounded-lg text-left transition-colors ${
              selectedFlower === flower.type
                ? "border-primary bg-primary-container/10"
                : "border-outline-variant hover:border-primary"
            }`}
            onClick={() => onFlowerChange(flower.type)}
          >
            <span className="block font-medium">{flower.label}</span>
            <span className="text-xs text-on-surface-variant">
              {flower.extra === 0
                ? "Included"
                : `+$${flower.extra.toFixed(2)}`}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ColorPicker({
  selectedColor,
  onColorChange,
}: Pick<CustomizationPanelProps, "selectedColor" | "onColorChange">) {
  return (
    <div>
      <h3 className="font-body text-[14px] leading-5 tracking-[0.05em] font-semibold text-on-surface mb-4">
        2. Wrapping Color
      </h3>
      <div className="flex flex-wrap gap-3">
        {WRAPPING_COLORS.map((color) => (
          <button
            key={color}
            className={`w-8 h-8 rounded-full border-2 transition-all ${
              selectedColor === color
                ? "border-primary ring-2 ring-offset-2 ring-primary"
                : "border-transparent hover:ring-2 hover:ring-offset-2 hover:ring-primary"
            }`}
            style={{ backgroundColor: color }}
            onClick={() => onColorChange(color)}
          />
        ))}
      </div>
    </div>
  );
}

function AccessoryPicker({
  accessories,
  onQtyChange,
}: Pick<CustomizationPanelProps, "accessories" | "onQtyChange">) {
  return (
    <div>
      <h3 className="font-body text-[14px] leading-5 tracking-[0.05em] font-semibold text-on-surface mb-4">
        3. Add Accessories
      </h3>
      <div className="space-y-4">
        {Object.entries(accessories).map(([key, acc]) => (
          <div key={key} className="flex items-center justify-between">
            <span className="font-body text-[16px] leading-6">
              {acc.name} (${acc.price})
            </span>
            <div className="flex items-center gap-3">
              <button
                className="w-8 h-8 rounded-full border border-outline-variant flex items-center justify-center hover:bg-surface-container-high transition-colors"
                onClick={() => onQtyChange(key, -1)}
              >
                -
              </button>
              <span className="w-4 text-center tabular-nums">{acc.qty}</span>
              <button
                className="w-8 h-8 rounded-full border border-outline-variant flex items-center justify-center hover:bg-surface-container-high transition-colors"
                onClick={() => onQtyChange(key, 1)}
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FinalTouches({
  touches,
  onToggleTouch,
}: Pick<CustomizationPanelProps, "touches" | "onToggleTouch">) {
  return (
    <div>
      <h3 className="font-body text-[14px] leading-5 tracking-[0.05em] font-semibold text-on-surface mb-4">
        4. Final Touches
      </h3>
      <div className="space-y-3">
        {Object.entries(touches).map(([key, touch]) => (
          <label key={key} className="flex items-center gap-3 cursor-pointer">
            <input
              className="rounded text-primary focus:ring-primary"
              type="checkbox"
              checked={touch.active}
              onChange={() => onToggleTouch(key)}
            />
            <span className="font-body text-[16px] leading-6">
              {touch.name} (+${touch.price.toFixed(2)})
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

/* ──────────────────────────── Main Component ──────────────────────────── */

export default function CustomizationPanel({
  selectedFlower,
  selectedColor,
  accessories,
  touches,
  onFlowerChange,
  onColorChange,
  onQtyChange,
  onToggleTouch,
}: CustomizationPanelProps) {
  return (
    <section className="space-y-6">
      <FlowerSelector
        selectedFlower={selectedFlower}
        onFlowerChange={onFlowerChange}
      />
      <ColorPicker
        selectedColor={selectedColor}
        onColorChange={onColorChange}
      />
      <AccessoryPicker
        accessories={accessories}
        onQtyChange={onQtyChange}
      />
      <FinalTouches
        touches={touches}
        onToggleTouch={onToggleTouch}
      />
    </section>
  );
}
