import type { Metadata } from "next";
import { Playfair_Display, Montserrat } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Flowera | Premium Flower Marketplace",
  description:
    "The world's most curated marketplace for meaningful floral gifts and botanical wonders.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${playfair.variable} ${montserrat.variable} h-full antialiased`}
    >
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-on-background font-body-md">
        <Navbar
          isLoggedIn={true}
          user={{
            name: "Eleanor Vance",
            avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuD74GXDH79_rfkCVsJ-l1nXPVWlZUhIT1hqT9lB3b5djBCPy5Ypm0oxQfIbLe2O15468KR-YTyXqj01viOvQrvrYWCH_zRwMBjNcWI6tSat3K6XAVWCLRWj1yMq-Pi3JL9S9cWIvGMnKAjl4AjYQRVih9GT-ut6-AMprXZCT3wr6PGFJJFplmOcTHJe-xvqWZPbfWmKG_beX5_2s2yktjUiHaTT-lrfRiZK5pw4riXjfXq0_K0a9EfRhy_wVwCk_gJ0p1uHtXHQjCY",
            memberLabel: "Premium Member",
          }}
        />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
