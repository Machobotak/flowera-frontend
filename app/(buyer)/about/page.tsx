"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import CorporateHeader from "@/components/layout/corporate-header";
import Footer from "@/components/layout/footer";


/* ──────────────────────────────────────────────────────────
   Scroll-reveal hook
   Triggers a CSS class when the element enters the viewport
────────────────────────────────────────────────────────── */
function useScrollReveal<T extends HTMLElement>(
  threshold = 0.15
): [React.RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return [ref, visible];
}

/* ──────────────────────────────────────────────────────────
   Reusable Section Wrapper
────────────────────────────────────────────────────────── */
function Section({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  const [ref, visible] = useScrollReveal<HTMLElement>();
  return (
    <section
      id={id}
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${className}`}
    >
      {children}
    </section>
  );
}

/* ──────────────────────────────────────────────────────────
   Section Label + Heading helper
────────────────────────────────────────────────────────── */
function SectionHeading({
  label,
  title,
  subtitle,
  center = false,
}: {
  label: string;
  title: React.ReactNode;
  subtitle?: string;
  center?: boolean;
}) {
  return (
    <div className={`mb-14 ${center ? "text-center" : ""}`}>
      <span
        className={`inline-block px-4 py-1.5 rounded-full text-[11px] font-semibold tracking-widest uppercase bg-primary-container/40 text-primary mb-4 ${
          center ? "mx-auto" : ""
        }`}
      >
        {label}
      </span>
      <h2
        className={`font-headline text-[32px] md:text-[42px] font-bold text-on-surface leading-tight mb-4 ${
          center ? "mx-auto" : ""
        }`}
        style={{ fontFamily: "var(--font-headline)" }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`text-on-surface-variant text-[16px] leading-relaxed max-w-2xl ${
            center ? "mx-auto" : ""
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   1. HERO SECTION
────────────────────────────────────────────────────────── */
function HeroSection() {
  return (
    <section
      id="about-hero"
      className="relative min-h-[80vh] flex items-center justify-center overflow-hidden"
    >
      {/* Decorative gradient blobs */}
      <div aria-hidden className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-secondary/10 blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] rounded-full bg-tertiary/6 blur-3xl" />
        {/* Floating petal dots */}
        <div className="absolute top-[18%] left-[12%] w-3 h-3 rounded-full bg-primary/25 animate-pulse" />
        <div
          className="absolute top-[30%] right-[18%] w-2 h-2 rounded-full bg-secondary/30 animate-pulse"
          style={{ animationDelay: "0.5s" }}
        />
        <div
          className="absolute bottom-[25%] left-[30%] w-4 h-4 rounded-full bg-tertiary/20 animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute bottom-[18%] right-[25%] w-2.5 h-2.5 rounded-full bg-primary/15 animate-pulse"
          style={{ animationDelay: "1.5s" }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-4xl mx-auto animate-[slideUp_0.6s_ease_both]">
        {/* Brand label */}
        <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary-container/50 text-primary text-[12px] font-semibold tracking-widest uppercase mb-8 border border-primary/10">
          <span
            className="material-symbols-outlined text-[16px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            local_florist
          </span>
          Tentang Flowera
        </span>

        {/* Headline */}
        <h1
          className="font-headline font-bold text-[42px] md:text-[64px] leading-[1.1] text-on-surface mb-6"
          style={{ fontFamily: "var(--font-headline)" }}
        >
          Temani Setiap{" "}
          <span className="relative">
            <span className="text-primary">Momen</span>{" "}
            <span className="absolute -bottom-1 left-0 right-0 h-1 rounded-full bg-primary/20" />
          </span>{" "}
          Bermakna.
        </h1>

        {/* Subheadline */}
        <p className="text-on-surface-variant text-[17px] md:text-[19px] leading-relaxed max-w-2xl mb-10">
          Flowera adalah marketplace florist pertama yang menghubungkan pelanggan
          dengan florist terpercaya di satu platform — karena setiap perasaan
          layak diungkapkan melalui bunga yang tepat.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/"
            className="px-8 py-4 bg-primary text-white rounded-xl text-[14px] font-semibold shadow-soft hover:shadow-float hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">
              storefront
            </span>
            Jelajahi Marketplace
          </Link>
          <Link
            href="/login"
            className="px-8 py-4 border border-outline-variant/50 text-on-surface rounded-xl text-[14px] font-semibold hover:bg-surface-container hover:border-primary/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">
              spa
            </span>
            Jadi Mitra Florist
          </Link>
        </div>

        {/* Scroll indicator */}
        <div className="mt-16 flex flex-col items-center gap-2 text-on-surface-variant/50 animate-bounce">
          <span className="text-[11px] tracking-widest uppercase">
            Scroll
          </span>
          <span className="material-symbols-outlined text-[20px]">
            keyboard_arrow_down
          </span>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────
   2. STORY SECTION
────────────────────────────────────────────────────────── */
function StorySection() {
  const paragraphs = [
    "Flowera lahir dari satu pertanyaan sederhana: mengapa mencari florist yang tepat untuk momen spesial harus terasa sulit?",
    "Sebelum Flowera hadir, pelanggan harus mengunjungi banyak toko satu per satu — menghabiskan waktu berharga saat momen penting justru tak boleh terlewatkan. Di sisi lain, para florist lokal berbakat kesulitan menjangkau pelanggan yang tepat.",
    "Flowera hadir sebagai jembatan. Satu platform yang memungkinkan siapa pun menemukan florist terpercaya, membandingkan pilihan, dan memesan bunga — dengan mudah, cepat, dan penuh kepercayaan.",
    "Karena kami percaya: setiap perasaan layak diungkapkan. Dan setiap momen bermakna berhak mendapatkan buket yang tepat.",
  ];

  const [ref, visible] = useScrollReveal<HTMLDivElement>();

  return (
    <section id="about-story" className="py-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left — Visual */}
        <div
          ref={ref}
          className={`relative transition-all duration-700 ease-out delay-100 ${
            visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
          }`}
        >
          {/* Stacked card effect */}
          <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-float">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-container/60 via-surface-container to-secondary-container/40" />
            {/* Decorative illustration using Material Symbols */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                {/* Central flower icon */}
                <div className="w-40 h-40 rounded-full bg-white/60 backdrop-blur-sm flex items-center justify-center shadow-float border border-white/80">
                  <span
                    className="material-symbols-outlined text-[80px] text-primary"
                    style={{
                      fontVariationSettings: "'FILL' 1, 'wght' 300",
                    }}
                  >
                    local_florist
                  </span>
                </div>
                {/* Orbiting icons */}
                <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center shadow-soft border border-white/60">
                  <span
                    className="material-symbols-outlined text-[22px] text-secondary"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    eco
                  </span>
                </div>
                <div className="absolute -bottom-4 -left-4 w-12 h-12 rounded-full bg-tertiary-container flex items-center justify-center shadow-soft border border-white/60">
                  <span
                    className="material-symbols-outlined text-[22px] text-tertiary"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    favorite
                  </span>
                </div>
                <div className="absolute top-1/2 -left-14 -translate-y-1/2 w-10 h-10 rounded-full bg-primary-container flex items-center justify-center shadow-soft border border-white/60">
                  <span
                    className="material-symbols-outlined text-[18px] text-primary"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    spa
                  </span>
                </div>
              </div>
            </div>
            {/* Bottom label */}
            <div className="absolute bottom-0 left-0 right-0 px-8 py-6 bg-gradient-to-t from-on-surface/50 to-transparent">
              <p className="text-white font-headline text-[18px] font-semibold" style={{ fontFamily: "var(--font-headline)" }}>
                "Setiap bunga menceritakan sebuah kisah."
              </p>
            </div>
          </div>
          {/* Decorative card behind */}
          <div
            aria-hidden
            className="absolute -bottom-4 -right-4 w-full h-full rounded-2xl bg-primary/8 -z-10"
          />
        </div>

        {/* Right — Text */}
        <div
          className={`transition-all duration-700 ease-out delay-200 ${
            visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
          }`}
        >
          <span className="inline-block px-4 py-1.5 rounded-full text-[11px] font-semibold tracking-widest uppercase bg-primary-container/40 text-primary mb-6">
            Cerita Kami
          </span>
          <h2
            className="font-headline font-bold text-[36px] md:text-[44px] text-on-surface leading-tight mb-8"
            style={{ fontFamily: "var(--font-headline)" }}
          >
            Mengapa{" "}
            <span className="text-primary">Flowera</span>{" "}
            Hadir
          </h2>
          <div className="space-y-5">
            {paragraphs.map((para, i) => (
              <p
                key={i}
                className="text-on-surface-variant text-[15px] leading-[1.8]"
              >
                {para}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────
   3. LOGO PHILOSOPHY SECTION
────────────────────────────────────────────────────────── */

const LOGO_ITEMS = [
  {
    icon: "local_florist",
    iconColor: "text-primary",
    iconBg: "bg-primary-container/50",
    title: "Kelopak Bunga",
    description:
      "Melambangkan keindahan, cinta, dan kebahagiaan — sekaligus merepresentasikan produk utama Flowera. Setiap kelopak adalah janji sebuah perasaan yang ingin diungkapkan.",
  },
  {
    icon: "eco",
    iconColor: "text-secondary",
    iconBg: "bg-secondary-container/50",
    title: "Daun",
    description:
      "Simbol kehidupan, kesegaran, dan pertumbuhan yang berkelanjutan. Mengingatkan kita bahwa setiap hubungan antara florist dan pelanggan harus tumbuh bersama.",
  },
  {
    icon: "font_download",
    iconColor: "text-tertiary",
    iconBg: "bg-tertiary-container/50",
    title: 'Huruf "F"',
    description:
      'Kelopak dan daun bersama membentuk huruf "F" — mewakili nama Flowera sekaligus memperkuat identitas floral yang kuat dan tak terlupakan.',
  },
];

function LogoPhilosophySection() {
  return (
    <Section
      id="about-logo"
      className="py-24 bg-surface-container-low rounded-3xl px-8 md:px-16"
    >
      <SectionHeading
        label="Filosofi Logo"
        title={
          <>
            Makna di Balik{" "}
            <span className="text-primary">Simbol</span> Kami
          </>
        }
        subtitle="Logo Flowera bukan sekadar gambar — ia adalah narasi visual yang merangkum nilai, identitas, dan misi yang kami emban setiap harinya."
        center
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {LOGO_ITEMS.map((item, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-8 shadow-soft hover:shadow-float transition-all group border border-outline-variant/10"
          >
            <div
              className={`w-16 h-16 rounded-2xl ${item.iconBg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
            >
              <span
                className={`material-symbols-outlined text-[32px] ${item.iconColor}`}
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {item.icon}
              </span>
            </div>
            <h3
              className="font-headline font-semibold text-[20px] text-on-surface mb-3"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              {item.title}
            </h3>
            <p className="text-on-surface-variant text-[14px] leading-[1.8]">
              {item.description}
            </p>
          </div>
        ))}
      </div>

      {/* Logo Display */}
      <div className="flex flex-col items-center gap-6">
        <div className="flex items-center justify-center w-40 h-40 rounded-full bg-gradient-to-br from-primary-container/60 to-secondary-container/40 shadow-float">
          <img
            src="/logo-v1-transparant.png"
            alt="Flowera Logo"
            className="h-20 w-auto"
          />
        </div>
        <p className="text-on-surface-variant text-[13px] tracking-widest uppercase font-semibold opacity-60">
          Flowera — Temani Setiap Momen Bermakna
        </p>
      </div>
    </Section>
  );
}

/* ──────────────────────────────────────────────────────────
   4. VISION & MISSION
────────────────────────────────────────────────────────── */

const MISSIONS = [
  {
    icon: "handshake",
    text: "Menghubungkan florist terpercaya dengan pelanggan yang tepat.",
  },
  {
    icon: "shopping_bag",
    text: "Menyederhanakan pengalaman berbelanja bunga secara digital.",
  },
  {
    icon: "store",
    text: "Mendukung pertumbuhan bisnis florist lokal Indonesia.",
  },
  {
    icon: "card_giftcard",
    text: "Menghadirkan pengalaman pemberian hadiah yang tak terlupakan.",
  },
];

function VisionMissionSection() {
  return (
    <Section id="about-vision" className="py-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Vision */}
        <div className="relative">
          <span className="inline-block px-4 py-1.5 rounded-full text-[11px] font-semibold tracking-widest uppercase bg-primary-container/40 text-primary mb-6">
            Visi
          </span>
          <h2
            className="font-headline font-bold text-[36px] text-on-surface leading-tight mb-6"
            style={{ fontFamily: "var(--font-headline)" }}
          >
            Marketplace florist{" "}
            <span className="text-primary">terpercaya</span> Indonesia.
          </h2>
          <p className="text-on-surface-variant text-[15px] leading-[1.8] mb-8">
            Menjadi marketplace florist terpercaya di Indonesia yang membantu
            semua orang merayakan momen bermakna melalui keindahan bunga —
            dari ulang tahun hingga pernikahan, dari wisuda hingga belasungkawa.
          </p>
          {/* Vision card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/90 to-primary-container/80 p-8 text-white shadow-float">
            <div aria-hidden className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
            <div aria-hidden className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/5" />
            <span
              className="material-symbols-outlined text-[48px] text-white/80 mb-4 block"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              visibility
            </span>
            <p className="font-headline text-[22px] font-semibold leading-snug relative z-10" style={{ fontFamily: "var(--font-headline)" }}>
              "Setiap momen bermakna berhak mendapatkan buket yang sempurna."
            </p>
          </div>
        </div>

        {/* Missions */}
        <div>
          <span className="inline-block px-4 py-1.5 rounded-full text-[11px] font-semibold tracking-widest uppercase bg-secondary-container/40 text-secondary mb-6">
            Misi
          </span>
          <h2
            className="font-headline font-bold text-[36px] text-on-surface leading-tight mb-8"
            style={{ fontFamily: "var(--font-headline)" }}
          >
            Apa yang kami{" "}
            <span className="text-secondary">perjuangkan</span>
          </h2>
          <div className="space-y-4">
            {MISSIONS.map((m, i) => (
              <div
                key={i}
                className="flex items-start gap-5 p-5 bg-white rounded-xl border border-outline-variant/10 shadow-soft hover:shadow-float hover:-translate-y-0.5 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-secondary-container/40 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <span
                    className="material-symbols-outlined text-[22px] text-secondary"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {m.icon}
                  </span>
                </div>
                <p className="text-on-surface text-[14px] leading-[1.7] pt-1">
                  {m.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ──────────────────────────────────────────────────────────
   5. WHY FLOWERA
────────────────────────────────────────────────────────── */

const WHY_ITEMS = [
  {
    icon: "verified",
    iconColor: "text-primary",
    iconBg: "bg-primary-container/50",
    title: "Florist Terpercaya",
    description:
      "Setiap florist di platform kami telah melalui kurasi untuk memastikan kualitas produk dan layanan yang konsisten.",
  },
  {
    icon: "celebration",
    iconColor: "text-tertiary",
    iconBg: "bg-tertiary-container/50",
    title: "Untuk Setiap Momen",
    description:
      "Temukan bunga untuk ulang tahun, pernikahan, wisuda, belasungkawa, anniversary, dan masih banyak lagi.",
  },
  {
    icon: "search",
    iconColor: "text-secondary",
    iconBg: "bg-secondary-container/50",
    title: "Belanja Mudah",
    description:
      "Browse, bandingkan, dan pesan bunga dari berbagai florist — semuanya dalam satu platform tanpa repot.",
  },
  {
    icon: "store",
    iconColor: "text-primary",
    iconBg: "bg-primary-container/30",
    title: "Dukung Florist Lokal",
    description:
      "Setiap transaksi di Flowera adalah langkah nyata untuk membantu florist lokal tumbuh dan berkembang secara digital.",
  },
];

function WhyFloweraSection() {
  return (
    <Section
      id="about-why"
      className="py-24"
    >
      <SectionHeading
        label="Mengapa Flowera"
        title={
          <>
            Lebih dari Sekadar{" "}
            <span className="text-primary">Toko Bunga</span>
          </>
        }
        subtitle="Flowera adalah ekosistem yang menghubungkan semangat florist lokal dengan kebutuhan pelanggan — dalam sebuah pengalaman yang elegan dan penuh makna."
        center
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {WHY_ITEMS.map((item, i) => (
          <div
            key={i}
            className="group relative bg-white rounded-2xl p-8 shadow-soft hover:shadow-float hover:-translate-y-1 transition-all border border-outline-variant/10 overflow-hidden"
          >
            {/* Background accent */}
            <div
              aria-hidden
              className={`absolute -top-6 -right-6 w-24 h-24 rounded-full ${item.iconBg} opacity-40 group-hover:scale-125 transition-transform duration-500`}
            />
            <div
              className={`relative z-10 w-14 h-14 rounded-2xl ${item.iconBg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
            >
              <span
                className={`material-symbols-outlined text-[28px] ${item.iconColor}`}
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {item.icon}
              </span>
            </div>
            <h3
              className="relative z-10 font-headline font-semibold text-[18px] text-on-surface mb-3"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              {item.title}
            </h3>
            <p className="relative z-10 text-on-surface-variant text-[13px] leading-[1.8]">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ──────────────────────────────────────────────────────────
   6. HOW FLOWERA WORKS — Timeline
────────────────────────────────────────────────────────── */

const HOW_STEPS = [
  {
    step: "01",
    icon: "travel_explore",
    title: "Temukan Florist",
    description:
      "Browse florist terpercaya di sekitar kamu. Filter berdasarkan lokasi, kategori, atau momen yang kamu butuhkan.",
  },
  {
    step: "02",
    icon: "local_florist",
    title: "Pilih Buket",
    description:
      "Jelajahi koleksi buket dari berbagai florist. Bandingkan pilihan, harga, dan ulasan pelanggan.",
  },
  {
    step: "03",
    icon: "shopping_cart_checkout",
    title: "Lakukan Pemesanan",
    description:
      "Pesan dengan mudah langsung dari platform. Proses cepat, aman, dan terpercaya.",
  },
  {
    step: "04",
    icon: "volunteer_activism",
    title: "Kirimkan Kebahagiaan",
    description:
      "Buket dikirimkan langsung oleh florist pilihan kamu. Kejutkan orang yang kamu cintai.",
  },
];

function HowItWorksSection() {
  return (
    <Section
      id="about-how"
      className="py-24 bg-surface-container-low rounded-3xl px-8 md:px-16"
    >
      <SectionHeading
        label="Cara Kerja"
        title={
          <>
            Mudah, Cepat,{" "}
            <span className="text-primary">Bermakna</span>
          </>
        }
        subtitle="Dari penemuan hingga pengiriman — Flowera merancang setiap langkah agar terasa mulus dan menyenangkan."
        center
      />

      <div className="relative">
        {/* Connecting line (desktop) */}
        <div
          aria-hidden
          className="hidden lg:block absolute top-14 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-outline-variant/40 to-transparent"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {HOW_STEPS.map((step, i) => (
            <div key={i} className="flex flex-col items-center text-center group">
              {/* Step number + Icon circle */}
              <div className="relative mb-6">
                <div className="w-28 h-28 rounded-full bg-white border-2 border-primary/15 flex items-center justify-center shadow-soft group-hover:shadow-float group-hover:border-primary/40 transition-all">
                  <span
                    className="material-symbols-outlined text-[44px] text-primary"
                    style={{ fontVariationSettings: "'FILL' 1, 'wght' 300" }}
                  >
                    {step.icon}
                  </span>
                </div>
                {/* Step badge */}
                <span className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-primary text-white text-[11px] font-bold flex items-center justify-center shadow-soft">
                  {step.step}
                </span>
              </div>

              <h3
                className="font-headline font-semibold text-[18px] text-on-surface mb-3"
                style={{ fontFamily: "var(--font-headline)" }}
              >
                {step.title}
              </h3>
              <p className="text-on-surface-variant text-[13px] leading-[1.8] max-w-[200px]">
                {step.description}
              </p>

              {/* Down arrow on mobile */}
              {i < HOW_STEPS.length - 1 && (
                <span className="lg:hidden material-symbols-outlined text-[24px] text-outline/40 mt-4">
                  keyboard_arrow_down
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}



/* ──────────────────────────────────────────────────────────
   8. TEAM SECTION
────────────────────────────────────────────────────────── */

const TEAM_MEMBERS = [
  { role: "Ahmad Fahmy Ghifariel Akbar", placeholder: "202410370110022", icon: "/assets/202410370110022.jpg" },
  {
    role: "Muhammad Ibrahim Al Ayubi",
    placeholder: "202410370110123",
    icon: "/assets/202410370110123.jpg",
  },
  {
    role: "Fiqri Ridho Firmansyah",
    placeholder: "202410370110167",
    icon: "/assets/202410370110167.jpg",
  },
  {
    role: "Ayshea Marvella Pasha",
    placeholder: "202410370110379",
    icon: "/assets/202410370110379.jpg",
  },
];

function TeamSection() {
  return (
    <Section
      id="about-team"
      className="py-24 bg-surface-container-low rounded-3xl px-8 md:px-16"
    >
      <SectionHeading
        label="Tim Kami"
        title={
          <>
            Kenali{" "}
            <span className="text-primary">Tim di Balik</span> Flowera
          </>
        }
        subtitle="Kami adalah tim yang bersemangat untuk mengubah cara orang mengekspresikan perasaan melalui bunga."
        center
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {TEAM_MEMBERS.map((member, i) => (
          <div
            key={i}
            className="group flex flex-col items-center text-center bg-white rounded-2xl p-8 shadow-soft hover:shadow-float hover:-translate-y-1 transition-all border border-outline-variant/10"
          >
            {/* Avatar image */}
            <div className="relative mb-5">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-soft group-hover:shadow-float transition-all">
                <img
                  src={member.icon}
                  alt={member.role}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Active indicator */}
              <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-secondary border-2 border-white" />
            </div>

            <p className="text-[12px] text-primary font-semibold mt-1">
              {member.role}
            </p>
            <p className="text-[11px] text-on-surface-variant/60 mt-2 italic">
              {member.placeholder}
            </p>
          </div>
        ))}
      </div>

    
    </Section>
  );
}

/* ──────────────────────────────────────────────────────────
   9. CTA SECTION
────────────────────────────────────────────────────────── */
function CTASection() {
  return (
    <Section id="about-cta" className="py-24">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-on-primary-container px-8 md:px-16 py-20 text-white text-center shadow-float">
        {/* Background decorations */}
        <div aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-white/5" />
          <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-white/5" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-white/3 border border-white/5" />
          {/* Floating icons */}
          <span
            className="material-symbols-outlined absolute top-8 left-[8%] text-[32px] text-white/20 animate-pulse"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            local_florist
          </span>
          <span
            className="material-symbols-outlined absolute bottom-8 right-[8%] text-[28px] text-white/20 animate-pulse"
            style={{
              fontVariationSettings: "'FILL' 1",
              animationDelay: "0.7s",
            }}
          >
            spa
          </span>
          <span
            className="material-symbols-outlined absolute top-1/4 right-[15%] text-[20px] text-white/15 animate-pulse"
            style={{
              fontVariationSettings: "'FILL' 1",
              animationDelay: "1.2s",
            }}
          >
            eco
          </span>
          <span
            className="material-symbols-outlined absolute bottom-1/4 left-[15%] text-[24px] text-white/15 animate-pulse"
            style={{
              fontVariationSettings: "'FILL' 1",
              animationDelay: "0.4s",
            }}
          >
            favorite
          </span>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-2xl mx-auto">
          <span
            className="material-symbols-outlined text-[56px] text-white/80 mb-6 block"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            local_florist
          </span>

          <h2
            className="font-headline font-bold text-[36px] md:text-[48px] leading-tight mb-6"
            style={{ fontFamily: "var(--font-headline)" }}
          >
            Siap Membuat Setiap Momen Bermakna?
          </h2>
          <p className="text-white/80 text-[16px] leading-relaxed mb-10 max-w-xl mx-auto">
            Temukan bunga-bunga indah dari florist terpercaya di seluruh
            Indonesia — semuanya dalam satu platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="px-10 py-4 bg-white text-primary rounded-xl text-[14px] font-semibold shadow-soft hover:shadow-float hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">
                storefront
              </span>
              Jelajahi Marketplace
            </Link>
            <Link
              href="/login"
              className="px-10 py-4 border-2 border-white/50 text-white rounded-xl text-[14px] font-semibold hover:bg-white/10 hover:border-white active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">spa</span>
              Jadi Mitra Florist
            </Link>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ──────────────────────────────────────────────────────────
   PAGE — assemble all sections
────────────────────────────────────────────────────────── */
export default function AboutPage() {
  return (
    /*
     * Full-screen fixed overlay — sits above the buyer shell (z-100 > z-50).
     * The overlay has its own CorporateHeader (sticky inside this scroll
     * container) and Footer, making the page 100% self-contained.
     * The buyer BuyerNavbar from the parent layout renders behind it and
     * is completely invisible to the visitor.
     */
    <div
      id="about-page-container"
      className="fixed inset-0 z-[100] bg-background overflow-y-auto overflow-x-hidden"
    >
      {/* ── Corporate header – sticky within this scroll container ── */}
      <CorporateHeader />

      {/* ── Page content ── */}
      <main className="bg-background overflow-x-hidden">
        {/* Hero */}
        <div className="max-w-container-max mx-auto px-margin-desktop">
          <HeroSection />
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-outline-variant/30 to-transparent" />

        {/* All other sections */}
        <div className="max-w-container-max mx-auto px-margin-desktop space-y-4">
          <StorySection />
          <LogoPhilosophySection />
          <VisionMissionSection />
          <WhyFloweraSection />
          <HowItWorksSection />
          <TeamSection />
          <CTASection />
        </div>

        {/* Bottom spacer */}
        <div className="h-16" />
      </main>

      {/* ── Footer – self-contained inside overlay ── */}
      <Footer />
    </div>
  );
}
