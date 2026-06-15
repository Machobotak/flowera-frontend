import React from "react";

/* ──────────────────────────── Props ──────────────────────────── */

interface ProductInfoProps {
  total: number;
}

/* ──────────────────────────── Component ──────────────────────────── */

export default function ProductInfo({ total }: ProductInfoProps) {
  return (
    <section className="border-b border-outline-variant pb-6">
      <nav className="flex gap-2 text-[12px] leading-4 tracking-[0.03em] font-medium text-on-surface-variant mb-4">
        <a className="hover:text-primary" href="/">
          Home
        </a>
        <span>/</span>
        <a className="hover:text-primary" href="#">
          Custom
        </a>
        <span>/</span>
        <span className="text-on-surface">Artisan Bouquet</span>
      </nav>
      <h1 className="font-headline text-[28px] leading-9 font-semibold text-on-surface mb-2">
        Bespoke Artisan Bouquet
      </h1>
      <div className="flex items-center gap-2 mb-4">
        <div className="flex text-tertiary">
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className="material-symbols-outlined text-sm"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              star
            </span>
          ))}
        </div>
        <span className="text-[12px] leading-4 tracking-[0.03em] font-medium text-on-surface-variant">
          4.9/5 (120 Reviews)
        </span>
      </div>
      <p className="text-[28px] leading-9 font-bold text-primary mb-2">
        ${total.toFixed(2)}
      </p>
      <p className="font-body text-[16px] leading-6 text-on-surface-variant">
        Hand-crafted by our master florists using the season&apos;s finest
        blooms.
      </p>
    </section>
  );
}
