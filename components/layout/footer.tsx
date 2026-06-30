"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";

/* ──────────────────────────────────────────────────────────
   Simple SVG social icons (no external dependency)
────────────────────────────────────────────────────────── */

function SocialIcon({ d, label }: { d: string; label: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-label={label}
      role="img"
    >
      <path d={d} />
    </svg>
  );
}

const InstagramIcon = () => (
  <SocialIcon label="Instagram" d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 0 2.5 1.25 1.25 0 0 1 0-2.5M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10m0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
);

const FacebookIcon = () => (
  <SocialIcon label="Facebook" d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02z" />
);

const TiktokIcon = () => (
  <SocialIcon label="TikTok" d="M12.53.02C13.84 0 15.14.01 16.44 0c.05 1.18.49 2.38 1.22 3.28.73.91 1.78 1.45 2.88 1.63v3.7c-.97-.1-1.92-.38-2.76-.89-.31-.19-.61-.4-.89-.63v5.55c0 3.69-2.99 6.68-6.68 6.68a6.63 6.63 0 0 1-5.49-2.95 6.68 6.68 0 0 0 7.23-2.3 6.65 6.65 0 0 1-4.57-2.3c.63-.01 1.26-.15 1.85-.41a6.67 6.67 0 0 1-3.79-6.5v-.09c.44.25.94.39 1.47.4a6.64 6.64 0 0 1-2.09-3.35c.63.39 1.33.65 2.06.76a6.66 6.66 0 0 1 5.56-4.78z" />
);

const YoutubeIcon = () => (
  <SocialIcon label="YouTube" d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z" />
);

const LinkedinIcon = () => (
  <SocialIcon label="LinkedIn" d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.44v-8.37H5.5v8.37h2.77z" />
);

/* ──────────────────────────────────────────────────────────
   Static data
────────────────────────────────────────────────────────── */

const INFORMATION_LINKS = [
  { label: "About Us",        href: "/about" },
  { label: "Delivery Info",   href: "/coming-soon" },
  { label: "Privacy Policy",  href: "/coming-soon" },
  { label: "Terms of Service",href: "/coming-soon" },
];

const PARTNER_LINKS = [
  { label: "Florist Partners",  href: "/coming-soon" },
  { label: "Affiliate Program", href: "/coming-soon" },
];

const LINKTREE = "https://linktr.ee/social.flowera?utm_source=linktree_profile_share&ltsid=ed342aa5-5af8-4778-bfac-eaa00800d2b6";

const SOCIAL_LINKS = [
  { icon: InstagramIcon, label: "Instagram", href: LINKTREE },
  { icon: FacebookIcon,  label: "Facebook",  href: LINKTREE },
  { icon: TiktokIcon,    label: "TikTok",    href: LINKTREE },
  { icon: YoutubeIcon,   label: "YouTube",   href: LINKTREE },
  { icon: LinkedinIcon,  label: "LinkedIn",  href: LINKTREE },
];

/* ──────────────────────────────────────────────────────────
   Component
────────────────────────────────────────────────────────── */

export default function Footer() {
  const { user } = useAuth();
  const isSeller = user?.roles?.includes("seller");
  const sellHref = isSeller ? "/store" : "/store/create";

  return (
    <footer className="hidden md:block bg-surface-container-low dark:bg-surface-container-high w-full pt-stack-lg pb-stack-md mt-stack-lg border-t border-outline-variant/30">
      <div className="flex flex-col items-center justify-center px-margin-mobile md:px-margin-desktop w-full max-w-container-max mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 w-full mb-12">

          {/* Brand */}
          <div className="col-span-1 space-y-4">
            <a href="/">
              <img src="/logo-v1-transparant.png" alt="Flowera" className="h-7 w-auto" />
            </a>
            <p className="font-body-md text-on-surface-variant pt-5">
              The world&apos;s most curated marketplace for meaningful floral
              gifts and botanical wonders.
            </p>
          </div>

          {/* Information Links */}
          <div className="col-span-1 flex flex-col gap-3">
            <h6 className="font-label-md text-secondary uppercase">Information</h6>
            {INFORMATION_LINKS.map((link) => (
              <Link
                key={link.label}
                className="text-on-surface-variant hover:text-primary transition-colors"
                href={link.href}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Partner Links */}
          <div className="col-span-1 flex flex-col gap-3">
            <h6 className="font-label-md text-secondary uppercase">Partners</h6>
            {PARTNER_LINKS.map((link) => (
              <Link
                key={link.label}
                className="text-on-surface-variant hover:text-primary transition-colors"
                href={link.href}
              >
                {link.label}
              </Link>
            ))}
            <Link
              className="text-on-surface-variant hover:text-primary transition-colors"
              href={sellHref}
            >
              {isSeller ? "Seller Centre" : "Sell on Flowera"}
            </Link>
          </div>

          {/* Newsletter + Social */}
          <div className="col-span-1 flex flex-col gap-4">
            <h6 className="font-label-md text-secondary uppercase">
              Join Our Bloom List
            </h6>
            <div className="flex gap-2">
              <input
                className="bg-white border-outline-variant/30 rounded-lg px-4 py-2 w-full"
                placeholder="Email address"
                type="email"
              />
              <button className="bg-primary text-white px-4 py-2 rounded-lg">
                <span className="material-symbols-outlined">send</span>
              </button>
            </div>

            {/* Social brand icons */}
            <div className="flex gap-4 pt-2">
              {SOCIAL_LINKS.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  aria-label={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-on-surface-variant hover:text-primary transition-colors"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

        </div>

        <p className="text-on-surface-variant font-label-md text-center pt-8 border-t border-outline-variant/10 w-full opacity-60">
          &copy; 2024 Flowera Marketplace. Crafted for life&apos;s meaningful
          moments.
        </p>
      </div>
    </footer>
  );
}
