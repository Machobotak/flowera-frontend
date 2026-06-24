"use client";

import React from "react";
import { usePathname } from "next/navigation";

const FOOTER_LINKS = {
  information: [
    { label: "About Us", href: "#" },
    { label: "Delivery Info", href: "#" },
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
  ],
  partners: [
    { label: "Florist Partners", href: "#" },
    { label: "Sell on Flowera", href: "#" },
    { label: "Affiliate Program", href: "#" },
  ],
};

const SOCIAL_ICONS = ["face_nod", "photo_camera", "share"];

export default function Footer() {
  const pathname = usePathname();
  
  // Hide footer on seller pages
  if (pathname?.startsWith("/store")) return null;

  return (
    <footer className="bg-surface-container-low dark:bg-surface-container-high w-full pt-stack-lg pb-stack-md mt-stack-lg border-t border-outline-variant/30">
      <div className="flex flex-col items-center justify-center px-margin-desktop w-full max-w-container-max mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 w-full mb-12">
          {/* Brand */}
          <div className="col-span-1 space-y-4">
            <a href="/">
              {/* <img src="/logo-v1.png" alt="Flowera" className="h-7 w-auto" /> */}
              <img src="/logo-v1-transparant.png" alt="Flowera" className="h-7 w-auto" />
            </a>
            <p className="font-body-md text-on-surface-variant pt-5">
              The world&apos;s most curated marketplace for meaningful floral
              gifts and botanical wonders.
            </p>
          </div>

          {/* Information Links */}
          <div className="col-span-1 flex flex-col gap-3">
            <h6 className="font-label-md text-secondary uppercase">
              Information
            </h6>
            {FOOTER_LINKS.information.map((link) => (
              <a
                key={link.label}
                className="text-on-surface-variant hover:text-primary transition-colors"
                href={link.href}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Partner Links */}
          <div className="col-span-1 flex flex-col gap-3">
            <h6 className="font-label-md text-secondary uppercase">Partners</h6>
            {FOOTER_LINKS.partners.map((link) => (
              <a
                key={link.label}
                className="text-on-surface-variant hover:text-primary transition-colors"
                href={link.href}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Newsletter */}
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
            <div className="flex gap-4 pt-2">
              {SOCIAL_ICONS.map((icon) => (
                <a
                  key={icon}
                  className="text-on-surface-variant hover:text-primary transition-colors"
                  href="#"
                >
                  <span className="material-symbols-outlined">{icon}</span>
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
