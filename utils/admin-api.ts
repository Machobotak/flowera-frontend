/**
 * Centralized API functions for admin endpoints.
 * All calls go through the Next.js rewrite proxy (/api/* → backend).
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
import type {
  AdminUserListResponse,
  AdminUserDetailResponse,
  AdminUserDeleteResponse,
  CreateAdminUserPayload,
  UpdateAdminUserPayload,
  AdminSellerListResponse,
  AdminSellerDetailResponse,
  AdminSellerDeleteResponse,
  CreateAdminSellerPayload,
  UpdateAdminSellerPayload,
} from "@/types/admin";

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

/* ─────────────────── Admin Users ─────────────────── */

const USER_BASE = "/api/admin/user";

export async function getAdminUsers(): Promise<AdminUserListResponse> {
  const res = await axios.get<AdminUserListResponse>(USER_BASE, { withCredentials: true });
  return res.data;
}

export async function getAdminUser(id: number | string): Promise<AdminUserDetailResponse> {
  const res = await axios.get<AdminUserDetailResponse>(`${USER_BASE}/${id}`, { withCredentials: true });
  return res.data;
}

export async function createAdminUser(
  payload: CreateAdminUserPayload
): Promise<AdminUserDetailResponse> {
  const res = await axios.post<AdminUserDetailResponse>(
    `${USER_BASE}/create`, payload, { withCredentials: true }
  );
  return res.data;
}

export async function updateAdminUser(
  id: number | string,
  payload: UpdateAdminUserPayload
): Promise<AdminUserDetailResponse> {
  const res = await axios.put<AdminUserDetailResponse>(
    `${USER_BASE}/update/${id}`, payload, { withCredentials: true }
  );
  return res.data;
}

export async function deleteAdminUser(
  id: number | string
): Promise<AdminUserDeleteResponse> {
  const res = await axios.delete<AdminUserDeleteResponse>(
    `${USER_BASE}/delete/${id}`, { withCredentials: true }
  );
  return res.data;
}

/* ─────────────────── Admin Sellers ─────────────────── */

const SELLER_BASE = "/api/admin/seller";

export async function getAdminSellers(): Promise<AdminSellerListResponse> {
  const res = await axios.get<AdminSellerListResponse>(SELLER_BASE, { withCredentials: true });
  return res.data;
}

export async function getAdminSeller(id: number | string): Promise<AdminSellerDetailResponse> {
  const res = await axios.get<AdminSellerDetailResponse>(`${SELLER_BASE}/${id}`, { withCredentials: true });
  return res.data;
}

export async function createAdminSeller(
  payload: CreateAdminSellerPayload
): Promise<AdminSellerDetailResponse> {
  const res = await axios.post<AdminSellerDetailResponse>(
    `${SELLER_BASE}/create`, payload, { withCredentials: true }
  );
  return res.data;
}

export async function updateAdminSeller(
  id: number | string,
  payload: UpdateAdminSellerPayload
): Promise<AdminSellerDetailResponse> {
  const res = await axios.put<AdminSellerDetailResponse>(
    `${SELLER_BASE}/update/${id}`, payload, { withCredentials: true }
  );
  return res.data;
}

export async function deleteAdminSeller(
  id: number | string
): Promise<AdminSellerDeleteResponse> {
  const res = await axios.delete<AdminSellerDeleteResponse>(
    `${SELLER_BASE}/delete/${id}`, { withCredentials: true }
  );
  return res.data;
}

/* ─────────────────── Admin Orders (for dashboard stats) ─────────────────── */

const ORDER_BASE = "/api/admin/order";

export async function getAdminOrders(): Promise<{ status: string; data: any[] }> {
  const res = await axios.get<{ status: string; data: any[] }>(ORDER_BASE, { withCredentials: true });
  return res.data;
}
