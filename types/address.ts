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
  user_id?: number;
  label?: string; // e.g. "Rumah", "Kantor"
  nama_penerima?: string; // nama penerima
  name?: string; // alias for nama_penerima
  recipient_name?: string; // alias for nama_penerima
  no_hp?: string; // no HP penerima
  phone?: string; // alias for no_hp
  phone_number?: string; // alias for no_hp
  address?: string; // full address string
  street?: string;
  city?: string;
  city_id?: number | string;
  province?: string;
  province_id?: number | string;
  district?: string;
  district_id?: number | string;
  postal_code?: string;
  postalCode?: string;
  is_default?: boolean;
  isDefault?: boolean;
  note?: string;
  created_at?: string;
  updated_at?: string;
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
  address: string; // full address (jalan, kec, kota, prov, kode pos)
  note?: string;
}

export interface UpdateAddressPayload {
  nama_penerima?: string;
  no_hp?: string;
  address?: string;
  note?: string;
  is_default?: boolean;
}
