/**
 * Types for shipping endpoints.
 *
 *   GET  /api/user/shipping/destinations?search=...  → search domestic destinations
 *   POST /api/user/shipping/cost                      → get shipping cost estimate
 */

/* ──────────────────────────── Destination Search ──────────────────────────── */

export interface DestinationData {
  id: number;
  label: string;
  province_name: string;
  city_name: string;
  district_name: string;
  subdistrict_name: string;
  zip_code: string;
}

export interface DestinationSearchResponse {
  meta: {
    message: string;
    code: number;
    status: string;
  };
  data: DestinationData[];
}

/* ──────────────────────────── Shipping Cost ──────────────────────────── */

export interface ShippingCostPayload {
  origin: string;       // origin zip code
  destination: string;  // destination zip code
  courier: string;      // colon-separated courier codes, e.g. "jne:sicepat:jnt"
  price: "lowest" | string;
}

export interface ShippingCostResult {
  courier_name: string;
  courier_code: string;
  courier_service: string;
  shipping_cost: number;
  shipping_etd: string;
}

export interface ShippingCostResponse {
  meta: {
    message: string;
    code: number;
    status: string;
  };
  data: ShippingCostResult[];
}
