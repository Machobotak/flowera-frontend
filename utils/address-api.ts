/**
 * Centralized API functions for user address endpoints.
 * All calls go through the Next.js rewrite proxy (/api/* → backend).
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

const BASE = "/api/user/address";

/* ──────────────────────────── Create Address ──────────────────────────── */

export async function createAddress(
  payload: CreateAddressPayload
): Promise<AddressDetailResponse> {
  const res = await axios.post<AddressDetailResponse>(BASE, payload, {
    withCredentials: true,
  });
  return res.data;
}

/* ──────────────────────────── List Addresses ──────────────────────────── */

export async function getAddresses(): Promise<AddressListResponse> {
  const res = await axios.get<AddressListResponse>(BASE, {
    withCredentials: true,
  });
  return res.data;
}

/* ──────────────────────────── Get Address Detail ──────────────────────────── */

export async function getAddressDetail(
  id: number | string
): Promise<AddressDetailResponse> {
  const res = await axios.get<AddressDetailResponse>(`${BASE}/${id}`, {
    withCredentials: true,
  });
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
    { withCredentials: true }
  );
  return res.data;
}

/* ──────────────────────────── Delete Address ──────────────────────────── */

export async function deleteAddress(
  id: number | string
): Promise<AddressDeleteResponse> {
  const res = await axios.delete<AddressDeleteResponse>(`${BASE}/${id}`, {
    withCredentials: true,
  });
  return res.data;
}
