/**
 * Types for user address endpoints.
 *
 *   GET    /api/user/address       → list all addresses
 *   GET    /api/user/address/:id   → detail
 *   POST   /api/user/address       → create
 *   PATCH  /api/user/address/:id   → update
 *   DELETE /api/user/address/:id   → delete
 */

/* ──────────────────────────── Address ──────────────────────────── */

export interface UserAddress {
  id: number;
  nama_penerima: string;
  no_hp: string;
  address: string; // detail jalan / RT RW
  note?: string;

  // Regional fields (matching Address entity)
  province_name?: string;
  city_name?: string;
  district_name?: string;
  subdistrict_name?: string;
  zip_code?: string;
  subdistrict_id?: string;

  createdAt?: string;
  updatedAt?: string;
}

/* ──────────────────────────── API Responses ──────────────────────────── */

export interface AddressListResponse {
  status: string;
  data: UserAddress[];
  message?: string;
}

export interface AddressDetailResponse {
  status: string;
  data: UserAddress;
  message?: string;
}

export interface AddressDeleteResponse {
  status: string;
  message?: string;
}

/* ──────────────────────────── Payloads ──────────────────────────── */

export interface CreateAddressPayload {
  nama_penerima: string;
  no_hp: string;
  address: string; // detail jalan
  note?: string;
  province_name?: string;
  city_name?: string;
  district_name?: string;
  subdistrict_name?: string;
  zip_code?: string;
  subdistrict_id?: string;
}

export interface UpdateAddressPayload {
  nama_penerima?: string;
  no_hp?: string;
  address?: string;
  note?: string;
  province_name?: string;
  city_name?: string;
  district_name?: string;
  subdistrict_name?: string;
  zip_code?: string;
  subdistrict_id?: string;
}
