"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import {
  FaInstagram,
  FaFacebook,
  FaTiktok,
  FaYoutube,
  FaLinkedin,
} from "react-icons/fa";

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
  { icon: FaInstagram, label: "Instagram", href: LINKTREE },
  { icon: FaFacebook,  label: "Facebook",  href: LINKTREE },
  { icon: FaTiktok,    label: "TikTok",    href: LINKTREE },
  { icon: FaYoutube,   label: "YouTube",   href: LINKTREE },
  { icon: FaLinkedin,  label: "LinkedIn",  href: LINKTREE },
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
                  <Icon size={20} />
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
