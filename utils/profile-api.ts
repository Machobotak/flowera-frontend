/**
 * Centralized API functions for user profile endpoints.
 * All calls go through the Next.js rewrite proxy (/api/* → backend).
 */

import axios from "axios";
import type {
  UpdateProfilePayload,
  ProfileDetailResponse,
} from "@/types/profile";

/* ──────────────────────────── Get Profile Detail ──────────────────────────── */

export async function getProfileDetail(): Promise<ProfileDetailResponse> {
  const res = await axios.get<ProfileDetailResponse>(
    "/api/user/profile/detail",
    { withCredentials: true }
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
    { withCredentials: true }
  );
  return res.data;
}
