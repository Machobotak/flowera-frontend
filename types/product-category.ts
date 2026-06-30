/**
 * Types for product category admin endpoints.
 *
 *   GET    /api/admin/product-categories               → list all
 *   POST   /api/admin/product-categories/create        → create
 *   PUT    /api/admin/product-categories/update/:id    → update
 *   DELETE /api/admin/product-categories/delete/:id    → delete
 *
 *   GET    /api/admin/sub-product-categories               → list all
 *   POST   /api/admin/sub-product-categories/create        → create
 *   PUT    /api/admin/sub-product-categories/update/:id    → update
 *   DELETE /api/admin/sub-product-categories/delete/:id    → delete
 */

/* ──────────────────────────── Category ──────────────────────────── */

export interface ProductCategory {
  id: number;
  title: string;
  created_at?: string;
  updated_at?: string;
}

export interface SubProductCategory {
  id: number;
  title: string;
  product_categories?: ProductCategory | null;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

/* ──────────────────────────── API Responses ──────────────────────────── */

export interface CategoryListResponse {
  status: string;
  data: ProductCategory[];
  message?: string;
}

export interface CategoryDetailResponse {
  status: string;
  data: ProductCategory;
  message?: string;
}

export interface CategoryDeleteResponse {
  status: string;
  message?: string;
}

export interface SubCategoryListResponse {
  status: string;
  data: SubProductCategory[];
  message?: string;
}

export interface SubCategoryDetailResponse {
  status: string;
  data: SubProductCategory;
  message?: string;
}

export interface SubCategoryDeleteResponse {
  status: string;
  message?: string;
}

/* ──────────────────────────── Payloads ──────────────────────────── */

export interface CreateCategoryPayload {
  title: string;
}

export interface UpdateCategoryPayload {
  title: string;
}

export interface CreateSubCategoryPayload {
  title: string;
  sub_product_categories_id: number;
}

export interface UpdateSubCategoryPayload {
  title?: string;
  sub_product_categories_id?: number;
}
