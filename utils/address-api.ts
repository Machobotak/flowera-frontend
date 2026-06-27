/**
 * Centralized API functions for user address endpoints.
 * Calls the backend directly via NEXT_PUBLIC_API_URL.
 *
 * Endpoints:
 *   POST   /api/user/address       → create address
 *   GET    /api/user/address       → list all addresses
 *   GET    /api/user/address/:id   → detail
 *   PATCH  /api/user/address/:id   → update
 *   DELETE /api/user/address/:id   → delete
 */

import axios from "axios";
import type {
  AddressListResponse,
  AddressDetailResponse,
  AddressDeleteResponse,
  CreateAddressPayload,
  UpdateAddressPayload,
} from "@/types/address";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
const BASE = `${API_BASE}/api/user/address`;

/** Build axios config with Bearer token from localStorage */
function authConfig() {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("accessToken")
      : null;
  return {
    withCredentials: true,
    ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
  };
}

/* ──────────────────────────── Create Address ──────────────────────────── */

export async function createAddress(
  payload: CreateAddressPayload
): Promise<AddressDetailResponse> {
  const res = await axios.post<AddressDetailResponse>(BASE, payload, authConfig());
  return res.data;
}

/* ──────────────────────────── List Addresses ──────────────────────────── */

export async function getAddresses(): Promise<AddressListResponse> {
  const res = await axios.get<AddressListResponse>(BASE, authConfig());
  return res.data;
}

/* ──────────────────────────── Get Address Detail ──────────────────────────── */

export async function getAddressDetail(
  id: number | string
): Promise<AddressDetailResponse> {
  const res = await axios.get<AddressDetailResponse>(`${BASE}/${id}`, authConfig());
  return res.data;
}

/* ──────────────────────────── Update Address ──────────────────────────── */

export async function updateAddress(
  id: number | string,
  payload: UpdateAddressPayload
): Promise<AddressDetailResponse> {
  const res = await axios.patch<AddressDetailResponse>(
    `${BASE}/${id}`,
    payload,
    authConfig()
  );
  return res.data;
}

/* ──────────────────────────── Delete Address ──────────────────────────── */

export async function deleteAddress(
  id: number | string
): Promise<AddressDeleteResponse> {
  const res = await axios.delete<AddressDeleteResponse>(`${BASE}/${id}`, authConfig());
  return res.data;
}
