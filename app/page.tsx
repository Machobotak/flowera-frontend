"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import ProductCard from "@/components/cards/product-card";
import FloristCard from "@/components/cards/florist-card";

/* ──────────────────────────── Data ──────────────────────────── */

const CATEGORIES = [
  { icon: "cake", label: "Birthday" },
  { icon: "favorite", label: "Anniversary" },
  { icon: "school", label: "Graduation" },
  { icon: "celebration", label: "Wedding" },
  { icon: "psychiatry", label: "Sympathy" },
  { icon: "auto_awesome", label: "Romantic" },
  { icon: "apartment", label: "Corporate" },
];

const PRODUCTS = [
  {
    name: "Midnight Grace",
    florist: "The Velvet Rose Florist",
    price: "Rp 450.000",
    rating: "4.9",
    location: "Jakarta Selatan",
    sold: "150+ terjual",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB2gUwgvHVeY6k-Mj9af0voVS5A7taBgEpmlkFTl1zVrhEOYtXz_p2qiRwDkkPYfepg8PZFoARMelNrheS_Sfbk7gimiQT8hYb7mvqWroNJsZWJfRXzN70p5V1vSnIljQcRwcPvUMZoxPB4KpASwBXWz6Z2zi_jo4jghhbkeD6Wq56PRXeXB3QyWkn8VdlTpjSKyJzdX3UfhpWT_yr54S666YNUHSjPPHFKHehPl0B0oX3KWA-UD3jX489q-4DErQXTgD4RjbM-wB0",
    imageAlt: "Premium bouquet of deep purple calla lilies and dark burgundy roses",
  },
  {
    name: "Cloud Nine",
    florist: "Petals & Prose",
    price: "Rp 875.000",
    rating: "5.0",
    location: "Tangerang",
    sold: "80+ terjual",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCaJaUCsxPovSgEVg_IdPJk-U3TF8jaudB-5nlaZznoYzz4VmlQCskaxsAIYHnqrhYGWzxCzpuJE-6n1HcT6M0CRrvTsANPkRA2lWwBdiy9feZMPcEYag94uNgVSOf6hMwUTGZQYVpJRUNwZAWf2sESnxOxte3GQRFuqDQwx1vD6Pger7utJIs3F5bztz1MjpKm-ipetcZbfj2VS4Lz7Pfnhy8AqbQbm3lBSQeITorIfIi8Yy0xXkvQXfX9K_DpHOxuhssTd57J4ZQ",
    imageAlt: "Luxurious bouquet of white hydrangeas and creamy roses",
  },
  {
    name: "Golden Hour",
    florist: "Sunlit Blooms",
    price: "Rp 320.000",
    rating: "4.8",
    location: "Jakarta Pusat",
    sold: "200+ terjual",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuALi3jtLys9GQK4zuPNTLeK5fH-p66mY-cHWAwD4bB86HAtWgVdzDsyjW0ILgI6Rl7fwyDwrXxOE5IkIo6NArfueTT8wzW5iZnUQYKUNqibjc3HH3X4mmsTmQLolHRVY_SVDTN6wSCyWscb_Akr9nuBg6CWJA1nqSAU0a7-WgNmmWMgJxd_LVZBsV2OEM1uB_ZHItrtYyIHzZ9eZBHmYaDUsC9Ml09B3EDEjzl0zNHW1jrY2nyPKjI-ByOqzX1zcjT5BLmQ86srKGs",
    imageAlt: "Vibrant sunflowers and blue delphiniums arrangement",
  },
  {
    name: "Seraphic Dream",
    florist: "Graceful Petals",
    price: "Rp 595.000",
    rating: "4.9",
    location: "Bandung",
    sold: "45+ terjual",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCq13s2kk1SI9h5iqcW6u_RJ7SPPBwAeyeCFkiAhvBgizv7pk0eGhQiqQ6i5ywdNa_It_aL4IMl0WZ9DvJ5hhFQx4HU3UQq6e2EIlfuTr6nVZ2l_VSECrQzQMdQkLbnNiSsfIiM5ToHikLAoxBnRn6RGa7TatYpmKZIttIt4ZqwprXn4KcC9FccEPsYgNmkBpgpH44sh9Y0PeF2qhBgvKIEIcvjbreH8uCpgSoVVLcLwh7tHiCx7xPG2Cnedgo2CkuWEYMABmzVVqA",
    imageAlt: "Elegant blush pink ranunculus and dusty miller leaves bouquet",
  },
  {
    name: "Scarlet Symphony",
    florist: "The Florist Lab",
    price: "Rp 1.250.000",
    rating: "5.0",
    location: "Surabaya",
    sold: "30+ terjual",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA589J2dyw5lGSPJJrZkF-l66EVd7eGPOvzDqOUwAttv__mRVYah9AsGCFeC5rcK_77ZKJwKAHJsZ_8sshU0_2P3Wdl7oJb8Ro1eaKSYwWah2apqE7nDQ82F2a4ORmOotRVA47cKOx4A-btzcOpkm9Dwz8Ug5BCynxO9KXjGIvQexBEL42vdqC1vAtQSbTEZoSYhLGwAV_bJF0GHSGmgivfY5VH3je6Oypnhxw-58CjSywx_08kC_dtt_jUSQ0TcAb9OEm4ErknIKo",
    imageAlt: "Dramatic red amaryllis and eucalyptus in black ceramic vase",
  },
];

const FLORISTS = [
  {
    name: "Petals & Prose",
    location: "Jakarta Selatan",
    distance: "1.2km",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAAIWMWK62_kRgFMUiL32wUxuw0i_PQ9F1SOO1tHRyUNzyL9RTBrUiF1rudx-F-V4nrveqi7WBkYwK0yds2VtivwQN3b9_YUaI5txapKtHUWJfUKzbM0zVlq4H0Ki66ltrDYnhdP4XcpLQ3oV14VJkbHCCnktRMEuWwPmRhl25KrBtHtdJYJObDlCXfgKd3XaaSj2kfMKz1AiSW-92O0DI5K2So3MxS7QTfblt1N4uUevcl0uMzBupKy4OZpJWEwER2bngzM4PDYhk",
    avatarAlt: "Petals & Prose florist shop",
    thumbnails: [
      {
        src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDfrwD4ty55_CXtc0HIKVhhGjH41vKuuAyPfQ80_I-YASLk5bRo23byncoE-a-6I8banhrgVQHndjqgG9W-E57HJC5AVQlm0GkgyE80hlEv8hLzzMK0Zy8KbHwiyod1sT3JFlvss_N19u0b66pz-TS1vI1alM4ZI51koeLbVhPmda7A_9RzcKQP_OLSAaPnTHB67EV-UQ-u80SEDPnN_Sfk3V7qg-rqiLHDpj2gTWWtIg2Xv5oahNxfuqi4pCEXNDxA8Cp0W8GEqTA",
        alt: "Minimalist rose bouquet",
      },
      {
        src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDQ--vBuCl6azUTmy_fCSCx7IxzB2JToqOQ1s1wQifyj_0srW74b3ta2Mj4H4D_z_sb2uOSZmgVaquDpDsxmXEhp8VKqvnnA4tSTIQ6RMvGcIo-vAG2jpUO0iO2tgj3_lHKluCosGaHlFcnamq-Z8mOZFck7K7U1evWARvcspWRm5BeDH6Yn_4rU0prKDFW8b8h9ZzPY5L2FXQAJIH0WGRDe_NZWz7GjFGWV8ApzvchjOpduzZLFJHMePUBKvkECVHw__6Lf46y6WA",
        alt: "Lily arrangement",
      },
      {
        src: "https://lh3.googleusercontent.com/aida-public/AB6AXuAVh3gzPIszXfHTn-TWcRj3Pzd59uyBKbf_GzDV3wcWGTr-gMLzSYJm9SayRUXD6XAgJh6UQingSVBhFD6BTMvOM0mA2S5FUFEF2VzUEEgsa6Zfs1pMQsLTGhm6NNs23zCdpFlXi4QLkwr8QHyb8mXdandI1gL72P3WiS3xFnya89OtCXZsDagEo3Eogt3PoRL-6el4vEBxLK6niNvm4e6XtRzte5GeEKgTYANVuQdA7polOcKQtjNUcKuHrk_0VYRsblFaIaJJk7M",
        alt: "Exotic tulips",
      },
    ],
  },
  {
    name: "Graceful Petals",
    location: "Jakarta Selatan",
    distance: "2.5km",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB4LiWu_jb48Ccyenhtq9El8exuC7AyEDqh8NRWYzoiT7Sp0lZcLE_WD1JALog9jDr2kaWIFixS7BEkL6JNDXGx6gXVLILZ8xMfdTgtv_wwyH_bCcplWfHiUGo81tWUUAt1-fuWAglwlcxm7cOjtnaqxQeSABM2JcHjeHL1oJ4xZKETX54efd9dZT0WRME5hYWEKjF4Pn0KWtrXvb-uY3zsfWygIzY4AlcAL-2aYDG3VglzAYaDNg-FBJX_ILlyD05zEQplgOvUK1g",
    avatarAlt: "Graceful Petals florist",
    thumbnails: [
      {
        src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDwnBJeMW4chvIW0LNEnNvxfLBH4eqdqN4W5Qj0ILz371feomsqwvQFNMBfe1mckroCgmmgG3DrKPwoiUs1vgpQeBTB-dGxl_RNOVd2YUFtbJE5Go_TI0e9LQHQvNjDdU2K3fh0xR6eQ11T4yAfIYfXvhy8-v5sF17m3UFuC05S__-J_FSCy0yA6IKvN8SjoMgIRA6zlPO2Ff_nSg0CUVHX2KvGu0FHMuCUP11gPDpYFrNxQ1z25WVnNdBjtinagb-z-_vl1cBgKCY",
        alt: "Pink bouquet",
      },
      {
        src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDDZR5XGZD3MZAl7hpjMOG0tCu-HoOjYDdCO2SexNyUkdaaoL9SAqqDk5stFBJ6NcpQPEanFYoDjyHP6SHCRnLLiACmi6kzkayGgVWqqX6Mx5agwr3uyNoRN4R-e0e9yuZKZKh_-tHc-N2lLbXJTOeEjkwK6cQrSh1pvdb7bg8HB2SKRHESjT6qLvf8L753HW9n2SwWOeVeSgFJNu_YFmc4sgaODVkkERHazJ8vPjrMO68AXZvqmZyDjd0mrpMGI0SrwCrzbIu_r2w",
        alt: "White lilies",
      },
      {
        src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBBIYGZ6W_Hq0yhyIC_HP4kBzI8g-0MyAEkPG_u1tjjwlVCKj3uQjOgHjfMd_fYl5_mZLY3cYE39-U8FFt_7-zyLxhHD9awG_rC6eMAuBgL1V4AgtsJ8UtKeLPfomOohgxssTBU_ojuahS9BNw2aSrZBQaq_0KstsrSHTIsr4bGlAj5mYJoTTgks2Jz71n5CyKLcMvwZnSoIaLvICj8C03HUwmDRk8HNPvbFqMXlACWa_AhrDBsIOqc7S9M2iKzto93Uja7HdkK4fQ",
        alt: "Ranunculus bouquet",
      },
    ],
  },
  {
    name: "Bloom & Bean",
    location: "Jakarta Selatan",
    distance: "3.1km",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBrsiNrXNh-D1Beo37WiuaKOpVIXYiyP0RHsdN_kqc7cQ4gjplxqrHidYorFy4Q3UGNew6fj9vg-6XYPyoLhssuqh1MjztPR2DMB1BKlZFkBLKH6zkGb6izZS2V48pbO5iKH-j87tAlYxSmXjrSZ_DD5dRASr2rO-wWr2x42T4A7ml8cBTEDCDYRpqDH87KojnSD5Xj4Synqzte4PRoh_M806Q7evcXIoeoWcdliStovuzK8URV6eS7vfO7W83_IrN72GmSNYs_4eg",
    avatarAlt: "Bloom & Bean florist",
    thumbnails: [
      {
        src: "https://lh3.googleusercontent.com/aida-public/AB6AXuCs-_IJmTFPfqDwg6_Yo5ykSelrVmwnfudqrbtE7OHaFugT71IyMFlvcWGaKBIQbx7XFIf0nnOensLRKPs3-Ipm7imMusJvQeChRoG8L0jUM_peQ-rDSwPJz5ECxL20IdVjiRKNmvDAZViVPPjzdh09U63oO6xgGDky9ebtSyMtfBPAz3FDKwCVMG6lNvPw-dANXz80uE8ndqK5go_vk1DSENRCfRUCwH_igej-eMO18xSDF8iZE4GIKZcCf2bJwC7IG8W4wpkheZA",
        alt: "Flower arrangement 1",
      },
      {
        src: "https://lh3.googleusercontent.com/aida-public/AB6AXuAm7OHJJrvNT6T40PLfKXeLlJZ2bIPxPXwjtNbLzo_6R6CtJ3Hxw_hjJs-if483pPZx-Ggt2Vcu2S8swmrOP-yVxPra3PUxinV4vJsTHTeebKm81jkJBv2IA-0rMCw6flmBYQuD6rjg-h5L-jsARJ0ojBJP8QItD0rc-EFsvRtPCMui2sivlaS5V_GdxyfVodpDPZS2oqLfi7JZYgly0-uVAgyaidkGHdzpXZg8_pZdU9S372Xpg8IHK88uSfNde7KTj2Cu05bN6zs",
        alt: "Flower arrangement 2",
      },
      {
        src: "https://lh3.googleusercontent.com/aida-public/AB6AXuCUsJezvmsF5zIjPVRQ1RiapjOmRe8Ub8YWQQneelziMuCaXpvslyIQgwkSV1AGAARn3gyLkWbye5I7fCPC4QWATlknlxAtE2EPikljQSIZ9Rqj0w21V8cKSb5bx0Eibk7Z1xfLg_pK0oRIcMKun6-DCoY0NJI7ZNraNjhQLSZk0NrVCm9ZsFsYgPpgX6cJ3YE_AmPF6QdjAckK4_kvhXozLj6BemJ9urdfGBTOm2HNWkuKdhFEUf8EiCa7inVccxVWBJG4xYabudY",
        alt: "Flower arrangement 3",
      },
    ],
  },
];

/* ──────────────────────────── Sections ──────────────────────────── */

const HERO_SLIDES = [
  {
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCHU-MNzSwSUbbUPvKZvCkAJnjjr1Q74pczA_BThQ1vmUXiAhigqFmfVM6UJBm6PKYLM6lwwR3NMrcTTLt9dYI6OdgW0NKTbW4t9TA8qu-ZUJaBia7VZ6ym3L57bQlqRQnEc0s2CL8xzuJjMzuFph9CXFRr3tv-TDqJl2Ju2inAm_6q0EVgsVwlto2C5UtHP0eocusr5WBn4VLNDYxwoz6p-itwOP7TBGSVeE-XuAy14jdF2ULjhxN4qEUGFGCz-m7liS_ZWUqg-1Y",
    title: "Seasonal Bloom",
    subtitle: "Collection",
    desc: "Experience the elegance of hand-picked peonies delivered fresh to your doorstep."
  },
  {
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB2gUwgvHVeY6k-Mj9af0voVS5A7taBgEpmlkFTl1zVrhEOYtXz_p2qiRwDkkPYfepg8PZFoARMelNrheS_Sfbk7gimiQT8hYb7mvqWroNJsZWJfRXzN70p5V1vSnIljQcRwcPvUMZoxPB4KpASwBXWz6Z2zi_jo4jghhbkeD6Wq56PRXeXB3QyWkn8VdlTpjSKyJzdX3UfhpWT_yr54S666YNUHSjPPHFKHehPl0B0oX3KWA-UD3jX489q-4DErQXTgD4RjbM-wB0",
    title: "Midnight Grace",
    subtitle: "Premium",
    desc: "A luxurious arrangement of deep purple calla lilies and dark burgundy roses."
  },
  {
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuALi3jtLys9GQK4zuPNTLeK5fH-p66mY-cHWAwD4bB86HAtWgVdzDsyjW0ILgI6Rl7fwyDwrXxOE5IkIo6NArfueTT8wzW5iZnUQYKUNqibjc3HH3X4mmsTmQLolHRVY_SVDTN6wSCyWscb_Akr9nuBg6CWJA1nqSAU0a7-WgNmmWMgJxd_LVZBsV2OEM1uB_ZHItrtYyIHzZ9eZBHmYaDUsC9Ml09B3EDEjzl0zNHW1jrY2nyPKjI-ByOqzX1zcjT5BLmQ86srKGs",
    title: "Golden Hour",
    subtitle: "Vibrant",
    desc: "Brighten someone's day with sunflowers and blue delphiniums."
  }
];

function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 15000); // 15 detik

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full aspect-[21/9] rounded-xl overflow-hidden shadow-float group">
      <div 
        className="absolute inset-0 flex transition-transform duration-1000 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {HERO_SLIDES.map((slide, idx) => (
          <div key={idx} className="min-w-full h-full relative">
            <img
              className="w-full h-full object-cover"
              alt={`${slide.title} ${slide.subtitle}`}
              src={slide.image}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-on-surface/60 to-transparent flex items-center px-16">
              <div className="max-w-md text-white">
                <h2 className="font-display-lg text-display-lg mb-4 leading-tight">
                  {slide.title} <br />
                  <span className="text-primary-fixed">{slide.subtitle}</span>
                </h2>
                <p className="font-body-lg text-body-lg mb-8 opacity-90 drop-shadow-md">
                  {slide.desc}
                </p>
                <button className="px-8 py-4 bg-primary-container text-on-primary-container font-label-md rounded-full shadow-lg hover:scale-105 transition-transform">
                  Shop The Collection
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {HERO_SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`h-2 rounded-full transition-all duration-500 ${
              currentSlide === idx ? "w-8 bg-white" : "w-2 bg-white/40 hover:bg-white/60"
            }`}
          />
        ))}
      </div>
    </section>
  );
}

function CategoryChips() {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h4 className="font-headline-md text-headline-md">
          Belanja Sesuai Kebutuhan
        </h4>
        <a className="text-primary font-label-md hover:underline" href="#">
          Lihat Semua
        </a>
      </div>

      <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.label}
            className="flex items-center gap-3 px-6 py-3 bg-surface border border-outline-variant/30 rounded-full whitespace-nowrap hover:bg-primary-container/10 transition-colors"
          >
            <span className="material-symbols-outlined text-primary">
              {cat.icon}
            </span>
            <span className="font-label-md">{cat.label}</span>
          </button>
        ))}
        <button className="flex items-center gap-3 px-6 py-3 bg-primary text-white rounded-full whitespace-nowrap hover:opacity-90 transition-colors">
          <span className="material-symbols-outlined">brush</span>
          <span className="font-label-md">Custom Bouquet</span>
        </button>
      </div>
    </section>
  );
}

function ExploreSection() {
  const [activeTab, setActiveTab] = useState<"products" | "florists">("products");

  // State untuk menyimpan data dari backend
  const [products, setProducts] = useState<any[]>([]);
  const [florists, setFlorists] = useState<any[]>([]);

  useEffect(() => {
    // TODO: Isi URL endpoint backend Anda di sini
    const fetchHomeData = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL+"/api/user/home";
        const res = await axios.get(API_URL);
        
        // Gunakan data dari endpoint backend
        const data = res.data;

        setProducts(data.product || []);
        setFlorists(data.store || []);
      } catch (error) {
        console.error("Gagal mengambil data home:", error);
      }
    };

    fetchHomeData();
  }, []);

  const getImageUrl = (path: string | null) => {
    if (!path) return "https://ui-avatars.com/api/?name=Image&background=random";
    if (path.startsWith("http")) return path;
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    return `${API_URL}${path}`;
  };

  return (
    <section className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex gap-2 p-1 bg-surface-container-low rounded-xl w-fit border border-outline-variant/20">
          <button
            onClick={() => setActiveTab("products")}
            className={`px-6 py-2.5 rounded-lg text-[14px] font-semibold transition-all ${
              activeTab === "products"
                ? "bg-white text-primary shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Trending Bouquets
          </button>
          <button
            onClick={() => setActiveTab("florists")}
            className={`px-6 py-2.5 rounded-lg text-[14px] font-semibold transition-all ${
              activeTab === "florists"
                ? "bg-white text-primary shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Nearby Florists
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="animate-[fadeIn_0.3s_ease]">
        {activeTab === "products" ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {products.map((product) => (
              <ProductCard 
                key={product.id} 
                name={product.name}
                florist={product.store?.name || "Unknown Florist"}
                price={`Rp ${product.price.toLocaleString("id-ID")}`}
                rating={product.rating > 0 ? product.rating.toString() : "Baru"}
                location={product.store?.city || "Unknown"}
                sold="0 terjual"
                image={getImageUrl(product.store?.logo)}
                imageAlt={product.name}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {florists.map((florist) => (
              <FloristCard 
                key={florist.id} 
                name={florist.name}
                location={florist.city || "Unknown City"}
                distance="Dekat Anda"
                avatar={getImageUrl(florist.logo)}
                avatarAlt={florist.name}
                thumbnails={[
                  { src: "https://ui-avatars.com/api/?name=1&background=random", alt: "thumb 1" },
                  { src: "https://ui-avatars.com/api/?name=2&background=random", alt: "thumb 2" },
                  { src: "https://ui-avatars.com/api/?name=3&background=random", alt: "thumb 3" }
                ]}
              />
            ))}
          </div>
        )}
      </div>

      {/* Load More Indicator */}
      <div className="flex justify-center pt-8 pb-4">
        <button className="px-8 py-3 border-2 border-primary text-primary font-semibold rounded-full hover:bg-primary-container/20 transition-colors">
          Muat Lebih Banyak
        </button>
      </div>
    </section>
  );
}

/* ──────────────────────────── Page ──────────────────────────── */

export default function Home() {
  return (
    <main className="max-w-container-max mx-auto px-margin-desktop space-y-stack-lg py-stack-md">
      <HeroCarousel />
      <CategoryChips />
      <ExploreSection />
    </main>
  );
}
