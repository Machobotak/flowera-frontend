/**
 * Types for admin user & seller management endpoints.
 *
 *   GET    /api/admin/user               → list all
 *   GET    /api/admin/user/:id           → get one
 *   POST   /api/admin/user/create        → create
 *   PUT    /api/admin/user/update/:id    → update
 *   DELETE /api/admin/user/delete/:id    → delete
 *
 *   GET    /api/admin/seller               → list all
 *   GET    /api/admin/seller/:id           → get one
 *   POST   /api/admin/seller/create        → create
 *   PUT    /api/admin/seller/update/:id    → update
 *   DELETE /api/admin/seller/delete/:id    → delete
 */

/* ──────────────────────────── Admin User ──────────────────────────── */

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  phone_number?: string;
  avatar?: string;
  googleId?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  seller?: {
    id: number;
    store?: { id: number; name: string } | null;
  } | null;
  admin?: { id: number; level: string } | null;
}

export interface AdminUserListResponse {
  status: string;
  data: AdminUser[];
  message?: string;
}

export interface AdminUserDetailResponse {
  status: string;
  data: AdminUser;
  message?: string;
}

export interface AdminUserDeleteResponse {
  status: string;
  message: string;
}

export interface CreateAdminUserPayload {
  name: string;
  email: string;
  password: string;
  phone_number?: string;
  avatar?: string;
}

export interface UpdateAdminUserPayload {
  name?: string;
  email?: string;
  password?: string;
  phone_number?: string;
  avatar?: string;
}

/* ──────────────────────────── Admin Seller ──────────────────────────── */

export interface AdminSeller {
  id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  user: AdminUser;
  store?: {
    id: number;
    name: string;
    slug: string;
    logo?: string;
    address: string;
    type: string;
    description?: string;
    rating: number;
    city: string;
    province_name: string;
    city_name: string;
    district_name: string;
    subdistrict_name: string;
    zip_code: string;
    subdistrict_id: string;
  } | null;
}

export interface AdminSellerListResponse {
  status: string;
  data: AdminSeller[];
  message?: string;
}

export interface AdminSellerDetailResponse {
  status: string;
  data: AdminSeller;
  message?: string;
}

export interface AdminSellerDeleteResponse {
  status: string;
  message: string;
}

export interface CreateAdminSellerPayload {
  name: string;
  email: string;
  password: string;
  phone_number?: string;
  store_name?: string;
  store_address?: string;
  store_type?: string;
  store_description?: string;
  city?: string;
  province_name?: string;
  city_name?: string;
  district_name?: string;
  subdistrict_name?: string;
  zip_code?: string;
  subdistrict_id?: string;
}

export type UpdateAdminSellerPayload = Partial<CreateAdminSellerPayload>;
