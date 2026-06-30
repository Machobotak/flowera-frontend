/**
 * Centralized API functions for shipping endpoints.
 * Calls the backend directly via NEXT_PUBLIC_API_URL.
 *
 * Endpoints:
 *   GET  /api/user/shipping/destinations?search=...  → search domestic destinations
 *   POST /api/user/shipping/cost                      → get shipping cost estimate
 */

import axios from "axios";
import type {
  DestinationSearchResponse,
  ShippingCostPayload,
  ShippingCostResponse,
} from "@/types/shipping";

const BASE = "/api/user/shipping";

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

/* ──────────────────────────── Search Destinations ──────────────────────────── */

/**
 * Search domestic destinations (subdistricts) by name.
 * @param query - Search string, e.g. "Sumbersekar Dau Malang"
 */
export async function searchDestinations(
  query: string
): Promise<DestinationSearchResponse> {
  const res = await axios.get<DestinationSearchResponse>(
    `${BASE}/destinations`,
    {
      ...authConfig(),
      params: { search: query },
    }
  );
  return res.data;
}

/* ──────────────────────────── Get Shipping Cost ──────────────────────────── */

/**
 * Get shipping cost estimates between two zip codes.
 * @param payload - origin zip, destination zip, couriers, and price mode
 */
export async function getShippingCost(
  payload: ShippingCostPayload
): Promise<ShippingCostResponse> {
  const res = await axios.post<ShippingCostResponse>(
    `${BASE}/cost`,
    payload,
    authConfig()
  );
  return res.data;
}
