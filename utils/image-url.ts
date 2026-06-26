/**
 * Shared image URL resolution utility.
 * Eliminates NEXT_PUBLIC_ACCESS_FILE_STORAGE duplication across pages.
 */

/**
 * Resolve a raw image path/url into a full URL.
 * If the path is already absolute (http/https), return as-is.
 * Otherwise prefix with the storage base URL.
 */
export function resolveImageUrl(raw: string | undefined | null): string {
  if (!raw) return "";
  if (raw.startsWith("http")) return raw;

  const baseUrl =
    process.env.NEXT_PUBLIC_ACCESS_FILE_STORAGE ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:3000";

  return raw.startsWith("/") ? `${baseUrl}${raw}` : `${baseUrl}/${raw}`;
}

/**
 * Get the best image URL from a product object.
 * Prioritizes default cover image, then first image, then fallback to ui-avatars.
 */
export function getProductImageUrl(product: any): string {
  const images = product.product_image || product.images;
  if (images && images.length > 0) {
    const img =
      images.find((i: any) => i.isDefault || i.is_default) || images[0];
    const url =
      img.image_url ||
      img.url ||
      img.path ||
      (typeof img === "string" ? img : null);
    if (url) return resolveImageUrl(url);
  }
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name || "P")}&background=8c4a5c&color=fff`;
}

/**
 * Get the first/default image URL from an array of image objects.
 * Typically used for variant/addon images.
 */
export function getImageUrlFromArray(images: any[]): string | undefined {
  if (!images || images.length === 0) return undefined;
  const raw = images[0]?.image_url || images[0]?.url || images[0]?.path;
  if (!raw) return undefined;
  return resolveImageUrl(raw);
}
