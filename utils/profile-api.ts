/**
 * Centralized API functions for user profile endpoints.
 * Calls go through Next.js rewrite proxy (/api/* → backend).
 */

import axios from "axios";
import type {
  UpdateProfilePayload,
  ProfileDetailResponse,
} from "@/types/profile";

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
    "/api/user/profile/detail",
    authConfig()
  );
  return res.data;
}

/* ──────────────────────────── Update Profile ──────────────────────────── */

export async function updateProfile(
  payload: UpdateProfilePayload
): Promise<ProfileDetailResponse> {
  const res = await axios.put<ProfileDetailResponse>(
    "/api/user/profile/update",
    payload,
    authConfig()
  );
  return res.data;
}
