/**
 * Centralized API functions for user profile endpoints.
 * Calls the backend directly via NEXT_PUBLIC_API_URL to avoid Next.js rewrite issues.
 */

import axios from "axios";
import type {
  UpdateProfilePayload,
  ProfileDetailResponse,
} from "@/types/profile";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

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

/* ──────────────────────────── Get Profile Detail ──────────────────────────── */

export async function getProfileDetail(): Promise<ProfileDetailResponse> {
  const res = await axios.get<ProfileDetailResponse>(
    `${API_BASE}/api/user/profile/detail`,
    authConfig()
  );
  return res.data;
}

/* ──────────────────────────── Update Profile ──────────────────────────── */

export async function updateProfile(
  payload: UpdateProfilePayload
): Promise<ProfileDetailResponse> {
  const res = await axios.put<ProfileDetailResponse>(
    `${API_BASE}/api/user/profile/update`,
    payload,
    authConfig()
  );
  return res.data;
}
