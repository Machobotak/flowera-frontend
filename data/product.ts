import type { FlowerOption, WrappingColor, ThumbnailImage } from "@/types/product";

/* ──────────────────────────── Constants ──────────────────────────── */

export const BASE_PRICE = 55;

export const FLOWER_OPTIONS: FlowerOption[] = [
  {
    type: "roses",
    label: "Roses",
    extra: 0,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAlxCGYf0kCA8GjMVjj3gy_tGqHvH3I5EgAqChbNHadQ5KfYii5hu1G636-M8SfpfmUxOnCy2dBHW4Sz5kWXjdTVHJ18dt5nIhhhf1fx7IQ2NqJcPEl-yyt3hTG6Kf0NUsJqNSOBrzgkUj6-nDBlaaNh0rwaQ-IeYxHXksU4_6unWJ_x34tXJIS2yCPvdEYGdS87TH7SLjNKXHJ5nA5pK9owKibCGZu5V7MBiF26Sg188Lw5AwuWYjb8fjfq3r6ky7505N_8yhkv8M",
  },
  {
    type: "tulips",
    label: "Tulips",
    extra: 12,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDWjPJUIvA_CiWBA_DPTi_zwPbeE7INrhYaCdH7shUD5MgdLN6pFxP4AmjA-LQYBfgrhizB1Y3Lj4tZB3ETUG5B8Nc8IdQiG3kAJa0upreULqo8JWeb2ElL7jH8fk1rdzFuIoRigRmGgj2MGGWpmjBGPKPKZHHi9q72gBRvaaDX7_A5DDhIzYw5VVvQFbVezYwHKcG6dRYMNXt34eIsZ9UX2A5N4FcP6hjc9rDBVSpHjnMAY5iHGWRpQNo6-SnkJRdPzDlJKw-p8PI",
  },
  {
    type: "lilies",
    label: "Lilies",
    extra: 15,
    image: "",
  },
  {
    type: "mixed",
    label: "Mixed",
    extra: 20,
    image: "",
  },
];

export const WRAPPING_COLORS: WrappingColor[] = [
  "#3a6847",
  "#8c4a5c",
  "#F8F4E1",
  "#1F1F1F",
];

export const THUMBNAIL_IMAGES: ThumbnailImage[] = [
  {
    type: "roses",
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuAkIHGciqgT8B8rAAtLvesGrjOcRy-mPYHlf2dfxeuPXTgFF6wVWNdHd-jxYB9xSvKdio0Owp8Ld0dJEdDQA3G6H7qiRXQ-HZK8wu55uLMkG2dhM_mociLi3AmQmnJs_eI9tjdHVxwnVZL_YKqvFuaw7JyN5SVLPo6B5Ps2lzeVY3hx5sIIOEs3skN85JSl424qV0LkUev-dt_sGMiTLniqELzkcD6hS9099tQpVY5VTUcm_t-9hIL-Rk5M69cbVpzkrsvE6spzsrc",
    alt: "Roses Thumb",
  },
  {
    type: "tulips",
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDWjPJUIvA_CiWBA_DPTi_zwPbeE7INrhYaCdH7shUD5MgdLN6pFxP4AmjA-LQYBfgrhizB1Y3Lj4tZB3ETUG5B8Nc8IdQiG3kAJa0upreULqo8JWeb2ElL7jH8fk1rdzFuIoRigRmGgj2MGGWpmjBGPKPKZHHi9q72gBRvaaDX7_A5DDhIzYw5VVvQFbVezYwHKcG6dRYMNXt34eIsZ9UX2A5N4FcP6hjc9rDBVSpHjnMAY5iHGWRpQNo6-SnkJRdPzDlJKw-p8PI",
    alt: "Tulips Thumb",
  },
];

export const TEDDY_OVERLAY_SRC =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBr9zzj83gRXyywUHo4tqJd97rGHfjNHs35HeOmdW4Abc1TYJY93MuOzI2cS7gwhgpNxtX38qgyi2Wi2uwL5I2dEDJm2C50j7zcn8Au63T1kOCqCuc0XDgGXQUQpRX0N2OePMsiYaFQC3ZZ0VCYV1E8mM0jGwfp1OagObAqdbJX2bwfBfKjfJgSHOMlFs0bn0WzZUhfs_zsgOgUhvYd8Z87khe6o_A7wOrofYgSn2Y1ZAWsNbHwVk7UzYYNrfQsTdAoLy7yYHXOarg";
