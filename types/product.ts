/* ──────────────────────────── Product Types ──────────────────────────── */

export type FlowerType = "roses" | "tulips" | "lilies" | "mixed";
export type WrappingColor = "#3a6847" | "#8c4a5c" | "#F8F4E1" | "#1F1F1F";

export interface FlowerOption {
  type: FlowerType;
  label: string;
  extra: number;
  image: string;
}

export interface AccessoryState {
  qty: number;
  price: number;
  name: string;
}

export interface TouchState {
  active: boolean;
  price: number;
  name: string;
}

export interface ThumbnailImage {
  type: FlowerType;
  src: string;
  alt: string;
}
