/**
 * Centralized API functions for admin endpoints.
 * All calls go through the Next.js rewrite proxy (/api/* → backend).
 *
 * Product Categories:
 *   GET    /api/admin/product-categories               → list all
 *   POST   /api/admin/product-categories/create        → create
 *   PUT    /api/admin/product-categories/update/:id    → update
 *   DELETE /api/admin/product-categories/delete/:id    → delete
 *
 * Sub Product Categories:
 *   GET    /api/admin/sub-product-categories               → list all
 *   POST   /api/admin/sub-product-categories/create        → create
 *   PUT    /api/admin/sub-product-categories/update/:id    → update
 *   DELETE /api/admin/sub-product-categories/delete/:id    → delete
 */

import axios from "axios";
import type {
  CategoryListResponse,
  CategoryDetailResponse,
  CategoryDeleteResponse,
  CreateCategoryPayload,
  UpdateCategoryPayload,
  SubCategoryListResponse,
  SubCategoryDetailResponse,
  SubCategoryDeleteResponse,
  CreateSubCategoryPayload,
  UpdateSubCategoryPayload,
} from "@/types/product-category";

const BASE = "/api/admin/product-categories";
const SUB_BASE = "/api/admin/sub-product-categories";

/* ─────────────────── Product Categories ─────────────────── */

export async function getCategories(): Promise<CategoryListResponse> {
  const res = await axios.get<CategoryListResponse>(BASE, { withCredentials: true });
  return res.data;
}

export async function createCategory(
  payload: CreateCategoryPayload
): Promise<CategoryDetailResponse> {
  const res = await axios.post<CategoryDetailResponse>(
    `${BASE}/create`, payload, { withCredentials: true }
  );
  return res.data;
}

export async function updateCategory(
  id: number | string,
  payload: UpdateCategoryPayload
): Promise<CategoryDetailResponse> {
  const res = await axios.put<CategoryDetailResponse>(
    `${BASE}/update/${id}`, payload, { withCredentials: true }
  );
  return res.data;
}

export async function deleteCategory(
  id: number | string
): Promise<CategoryDeleteResponse> {
  const res = await axios.delete<CategoryDeleteResponse>(
    `${BASE}/delete/${id}`, { withCredentials: true }
  );
  return res.data;
}

/* ─────────────────── Sub Product Categories ─────────────────── */

export async function getSubCategories(): Promise<SubCategoryListResponse> {
  const res = await axios.get<SubCategoryListResponse>(SUB_BASE, { withCredentials: true });
  return res.data;
}

export async function createSubCategory(
  payload: CreateSubCategoryPayload
): Promise<SubCategoryDetailResponse> {
  const res = await axios.post<SubCategoryDetailResponse>(
    `${SUB_BASE}/create`, payload, { withCredentials: true }
  );
  return res.data;
}

export async function updateSubCategory(
  id: number | string,
  payload: UpdateSubCategoryPayload
): Promise<SubCategoryDetailResponse> {
  const res = await axios.put<SubCategoryDetailResponse>(
    `${SUB_BASE}/update/${id}`, payload, { withCredentials: true }
  );
  return res.data;
}

export async function deleteSubCategory(
  id: number | string
): Promise<SubCategoryDeleteResponse> {
  const res = await axios.delete<SubCategoryDeleteResponse>(
    `${SUB_BASE}/delete/${id}`, { withCredentials: true }
  );
  return res.data;
}
