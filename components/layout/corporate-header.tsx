"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";

/* ────────────────────────────────────────────────────────
   Constants
──────────────────────────────────────────────────────── */

/** Height of the sticky header in pixels – used for scroll offset compensation */
const HEADER_H = 64;

/**
 * Every `<section id="…">` that lives on the About page.
 * Order matters: we walk from top to bottom to detect the active one.
 */
const ALL_SECTION_IDS = [
  "about-hero",
  "about-story",
  "about-logo",
  "about-vision",
  "about-why",
  "about-how",
  "about-team",
  "about-cta",
] as const;

/**
 * Maps every section id → the nav item that should be highlighted.
 * Multiple body sections can map to the same nav item.
 */
const SECTION_TO_NAV: Record<string, string> = {
  "about-hero":    "about-hero",
  "about-story":   "about-story",
  "about-logo":    "about-story",   // Logo philosophy sits in the story flow
  "about-vision":  "about-vision",
  "about-why":     "about-vision",  // "Why Flowera" belongs to the Vision cluster
  "about-how":     "about-vision",  // "How it works" also belongs there
  "about-team":    "about-team",
  "about-cta":     "about-cta",
};

interface NavItem {
  label: string;
  sectionId?: string;   // scroll-to target
  href?: string;        // external link (no scroll)
  icon?: string;        // Material Symbol name (optional)
}

const NAV_ITEMS: NavItem[] = [
  { label: "Home",             href: "/",              icon: "arrow_back" },
  { label: "About",            sectionId: "about-hero" },
  { label: "Our Story",        sectionId: "about-story" },
  { label: "Vision & Mission", sectionId: "about-vision" },
  { label: "Team",             sectionId: "about-team" },
  { label: "Contact",          sectionId: "about-cta" },
];

/* ────────────────────────────────────────────────────────
   Component
──────────────────────────────────────────────────────── */

export default function CorporateHeader() {
  const [activeNav, setActiveNav]       = useState<string>("about-hero");
  const [isScrolled, setIsScrolled]     = useState(false);
  const [menuOpen, setMenuOpen]         = useState(false);
  const [progress, setProgress]         = useState(0);

  /* ── Smooth-scroll to a section inside the overlay container ── */
  const scrollToSection = useCallback((sectionId: string) => {
    const container = document.getElementById("about-page-container");
    const target    = document.getElementById(sectionId);
    if (!container || !target) return;

    // offsetTop of the target relative to the container's scroll axis
    const top = target.offsetTop - HEADER_H - 8;
    container.scrollTo({ top, behavior: "smooth" });
    setMenuOpen(false);
  }, []);

  /* ── Bind scroll tracking to the overlay container ── */
  useEffect(() => {
    const container = document.getElementById("about-page-container");
    if (!container) return;

    const onScroll = () => {
      const scrollTop    = container.scrollTop;
      const scrollRange  = container.scrollHeight - container.clientHeight;

      // Shadow trigger
      setIsScrolled(scrollTop > 24);

      // Reading progress 0 → 1
      setProgress(scrollRange > 0 ? scrollTop / scrollRange : 0);

      // Active-section spy
      // We walk ALL_SECTION_IDS in order; a section "wins" if its top
      // edge has passed the header bottom (with a small grace area).
      let current: (typeof ALL_SECTION_IDS)[number] = ALL_SECTION_IDS[0];
      for (const id of ALL_SECTION_IDS) {
        const el = document.getElementById(id);
        if (!el) continue;
        // getBoundingClientRect is viewport-relative; our container IS the viewport
        if (el.getBoundingClientRect().top <= HEADER_H + 48) {
          current = id;
        }
      }
      setActiveNav(SECTION_TO_NAV[current] ?? "about-hero");
    };

    container.addEventListener("scroll", onScroll, { passive: true });
    return () => container.removeEventListener("scroll", onScroll);
  }, []);

  /* ── Close mobile menu on breakpoint change ── */
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMenuOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /* ── Helpers ── */
  const isActive = (item: NavItem) =>
    !!item.sectionId && activeNav === item.sectionId;

  return (
    <header
      role="banner"
      aria-label="Flowera corporate navigation"
      className={`sticky top-0 z-50 w-full bg-white transition-all duration-300 ${
        isScrolled
          ? "shadow-[0_2px_24px_rgba(140,74,92,0.07)] border-b border-outline-variant/15"
          : "border-b border-outline-variant/10"
      }`}
    >
      {/* ── Main bar ── */}
      <div className="max-w-container-max mx-auto px-margin-desktop">
        <div className="flex items-center justify-between h-16">

          {/* ── Brand ── */}
          <Link
            href="/"
            className="shrink-0 flex items-center gap-3 hover:opacity-90 transition-opacity"
            aria-label="Flowera home"
          >
            <img
              src="/logo-v1-transparant.png"
              alt="Flowera"
              className="h-7 w-auto"
            />
            {/* Divider + "Company" label – desktop only */}
            <span className="hidden lg:flex items-center gap-3 select-none">
              <span className="w-px h-4 bg-outline-variant/50" aria-hidden />
              <span className="text-[10px] font-semibold tracking-[0.18em] uppercase text-on-surface-variant/50">
                Company
              </span>
            </span>
          </Link>

          {/* ── Desktop nav ── */}
          <nav className="hidden md:block" aria-label="Page sections">
            <ul className="flex items-stretch h-16 gap-0" role="list">
              {NAV_ITEMS.map((item) => {
                const active = isActive(item);
                const isHome = !!item.href;

                return (
                  <li key={item.label} className="flex items-center">
                    {isHome ? (
                      /* "Home" → external link */
                      <Link
                        href={item.href!}
                        className={`
                          relative h-full flex items-center gap-1.5 px-4 text-[13px] font-medium
                          text-on-surface-variant hover:text-primary
                          transition-colors duration-200
                          border-r border-outline-variant/15 mr-2 pr-6
                        `}
                      >
                        <span
                          className="material-symbols-outlined text-[15px]"
                          aria-hidden
                        >
                          arrow_back
                        </span>
                        {item.label}
                      </Link>
                    ) : (
                      /* Scroll-to nav item */
                      <button
                        type="button"
                        onClick={() => item.sectionId && scrollToSection(item.sectionId)}
                        className={`
                          relative h-full flex items-center px-4 text-[13px] font-medium
                          transition-colors duration-200
                          ${active
                            ? "text-primary"
                            : "text-on-surface-variant hover:text-on-surface"
                          }
                        `}
                        aria-current={active ? "page" : undefined}
                      >
                        {item.label}

                        {/* Active underline — animates in/out */}
                        <span
                          className="
                            absolute bottom-0 left-3 right-3 h-[2px] rounded-t-full
                            bg-primary transition-all duration-300
                          "
                          style={{
                            transform:  active ? "scaleX(1)"  : "scaleX(0)",
                            opacity:    active ? 1             : 0,
                            transformOrigin: "center",
                          }}
                          aria-hidden
                        />
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* ── Mobile hamburger ── */}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="md:hidden relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-surface-container transition-colors"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            aria-controls="corporate-mobile-menu"
          >
            {/* "menu" icon — fades out when open */}
            <span
              className="material-symbols-outlined text-[22px] text-on-surface absolute transition-all duration-200"
              style={{
                opacity:   menuOpen ? 0   : 1,
                transform: menuOpen ? "rotate(90deg) scale(0.6)" : "rotate(0) scale(1)",
              }}
              aria-hidden
            >
              menu
            </span>
            {/* "close" icon — fades in when open */}
            <span
              className="material-symbols-outlined text-[22px] text-on-surface absolute transition-all duration-200"
              style={{
                opacity:   menuOpen ? 1   : 0,
                transform: menuOpen ? "rotate(0) scale(1)" : "rotate(-90deg) scale(0.6)",
              }}
              aria-hidden
            >
              close
            </span>
          </button>
        </div>
      </div>

      {/* ── Reading progress bar (bottom edge of header) ── */}
      <div
        aria-hidden
        className="absolute bottom-0 left-0 h-[2px] rounded-r-full bg-gradient-to-r from-primary to-primary-container/70 transition-[width] duration-150 ease-out pointer-events-none"
        style={{ width: `${progress * 100}%` }}
      />

      {/* ── Mobile menu (expands header) ── */}
      {menuOpen && (
        <div
          id="corporate-mobile-menu"
          role="navigation"
          aria-label="Mobile page sections"
          className="md:hidden border-t border-outline-variant/10 bg-white animate-[slideUp_0.22s_ease]"
        >
          <ul
            className="max-w-container-max mx-auto px-margin-desktop py-3 space-y-0.5"
            role="list"
          >
            {NAV_ITEMS.map((item) => {
              const active  = isActive(item);
              const isHome  = !!item.href;

              return (
                <li key={item.label}>
                  {isHome ? (
                    <Link
                      href={item.href!}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-medium text-on-surface-variant hover:text-primary hover:bg-primary-container/10 transition-all"
                    >
                      <span className="material-symbols-outlined text-[18px]" aria-hidden>
                        arrow_back
                      </span>
                      {item.label}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => item.sectionId && scrollToSection(item.sectionId)}
                      className={`
                        w-full flex items-center gap-3 px-4 py-3 rounded-xl
                        text-[14px] font-medium transition-all text-left
                        ${active
                          ? "text-primary bg-primary-container/15 font-semibold"
                          : "text-on-surface-variant hover:text-primary hover:bg-primary-container/10"
                        }
                      `}
                      aria-current={active ? "page" : undefined}
                    >
                      {/* Active dot indicator */}
                      <span
                        className={`
                          w-1.5 h-1.5 rounded-full flex-shrink-0 transition-all duration-200
                          ${active ? "bg-primary scale-100" : "bg-transparent scale-0"}
                        `}
                        aria-hidden
                      />
                      {item.label}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </header>
  );
}
