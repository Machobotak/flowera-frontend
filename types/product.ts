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

/* ──────────────────────────── Product Variant Types ──────────────────────────── */

export interface ProductVariantPayload {
  title: string;
  sub_title: string;
  price: number;
  product_id: number;
}

export interface ProductVariantData {
  id: number;
  title: string;
  sub_title: string;
  price: number;
  product_id: number;
  createdAt?: string;
  updatedAt?: string;
}

/** Local form state for a variant (price kept as string for input handling) */
export interface VariantFormEntry {
  localId: string; // temp client-side ID for React keys
  title: string;
  sub_title: string;
  price: string;
  backendId?: number; // populated after save or when loaded from server
  imageFile?: File;   // new image to upload (only for create/update)
  imagePreview?: string; // object URL for preview
}
