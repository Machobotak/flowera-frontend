/* ──────────────────────────── Profile Types ──────────────────────────── */

/** Full user profile returned by GET /api/user/profile/detail */
export interface UserProfile {
  id: number;
  name: string;
  email: string;
  no_hp: string;
  phone_number?: string;
  phone?: string;
  birth_place: string;
  birth_date: string;
  /** @deprecated — fallback for older backend versions */
  birt_date?: string;
  /** @deprecated — fallback for older backend versions */
  birthday?: string;
  /** @deprecated — fallback for older backend versions */
  birthDate?: string;
  /** @deprecated — fallback for older backend versions */
  tanggal_lahir?: string;
  gender: string;
  avatar: string;
  image_url?: string;
  memberLabel?: string;
}

/** Payload for PUT /api/user/profile/update */
export interface UpdateProfilePayload {
  no_hp?: string;
  birth_place?: string;
  birth_date?: string;
  gender?: string;
}

/** Standard wrapper shape: { data: UserProfile } */
export interface ProfileDetailResponse {
  data: UserProfile;
}
